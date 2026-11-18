import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Coffee } from "lucide-react";
import StarRing from "../StarRing";
import { startBreakNow } from "../../lib/reminderWindow";
import { describeSeconds, readBreaks, readSessions, type Session } from "../../lib/settings";
import useTimeCount from "../../hooks/useTimeCount";

interface Snapshot {
  remainingSeconds: number;
  workSeconds: number;
  breakSeconds: number;
  sessionIndex: number;
  sessionCount: number;
  strict: boolean;
}

function clock(total: number): string {
  const s = Math.max(0, Math.round(total));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * The one screen worth opening.
 *
 * Its single figure is the time left before the next break, because that is the only
 * question this app exists to answer. Everything else on the page is quiet.
 */
export default function Today() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [breaks, setBreaks] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const used = useTimeCount();

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const next = await invoke<Snapshot>("reminder_snapshot");
        if (alive) setSnap(next);
      } catch {
        /* the clock is not up yet on the very first paint */
      }
    };
    void poll();
    const id = window.setInterval(poll, 1000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    void readBreaks().then(setBreaks);
    void readSessions().then(setSessions);
  }, [snap?.sessionIndex]);

  const progress =
    snap && snap.workSeconds > 0 ? snap.remainingSeconds / snap.workSeconds : 0;
  const current = sessions[snap?.sessionIndex ?? 0] ?? sessions[0];

  // The ring already says how long is left, so the sentence says the other half of the
  // answer: the time on the clock when the break arrives. Two numbers, two meanings.
  const dueAt = new Date(Date.now() + (snap?.remainingSeconds ?? 0) * 1000);
  const dueLabel = `${String(dueAt.getHours()).padStart(2, "0")}:${String(
    dueAt.getMinutes()
  ).padStart(2, "0")}`;

  return (
    <div className="mx-auto flex h-full max-w-[560px] flex-col justify-center gap-8">
      <div className="flex items-center gap-8">
        <StarRing progress={progress} size={168} stroke={5} className="text-moment">
          <div className="text-center">
            <div className="text-[30px] font-medium leading-none tabular-nums text-foreground">
              {snap ? clock(snap.remainingSeconds) : "--:--"}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">còn lại</div>
          </div>
        </StarRing>

        <div className="min-w-0">
          <h1 className="text-[13px] font-medium text-muted-foreground">Hôm nay</h1>
          <p className="mt-1 text-[15px] leading-snug text-foreground">
            Lần nghỉ tới lúc <span className="tabular-nums">{dueLabel}</span>
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {current
              ? `Làm ${current.workMinutes} phút, rồi nghỉ ${describeSeconds(current.breakSeconds)}.`
              : "Chưa đặt được chu kỳ."}
          </p>
          <button
            type="button"
            onClick={() => void startBreakNow()}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Coffee size={15} strokeWidth={1.5} />
            Nghỉ ngay
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 border-t border-border pt-6">
        <div>
          <dt className="text-[11px] text-muted-foreground">Số lần nhắc hôm nay</dt>
          <dd className="mt-1 text-[19px] font-medium tabular-nums text-foreground">{breaks}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Đã dùng máy</dt>
          <dd className="mt-1 text-[19px] font-medium tabular-nums text-foreground">
            {used.hours} giờ {String(used.minutes).padStart(2, "0")} phút
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">
            {(snap?.sessionCount ?? 1) > 1 ? "Phiên" : "Mỗi lần nghỉ"}
          </dt>
          <dd className="mt-1 text-[19px] font-medium tabular-nums text-foreground">
            {(snap?.sessionCount ?? 1) > 1 ? (
              <>
                {(snap?.sessionIndex ?? 0) + 1}
                <span className="text-[13px] font-normal text-muted-foreground">
                  /{snap?.sessionCount}
                </span>
              </>
            ) : (
              describeSeconds(snap?.breakSeconds ?? 20)
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
