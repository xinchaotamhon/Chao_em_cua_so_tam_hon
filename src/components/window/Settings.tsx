import { useCallback, useEffect, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { isEnabled, enable, disable } from "@tauri-apps/plugin-autostart";
import toast from "react-hot-toast";
import { Image as ImageIcon, Music4, X } from "lucide-react";

import Toggle from "../Toggle";
import {
  DEFAULT_SESSIONS,
  DEFAULT_TEXT,
  K,
  MAX_SESSIONS,
  openStore,
  sanitizeSessions,
  type Media,
  type Session,
} from "../../lib/settings";

const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp"];
const SOUND_EXT = ["mp3", "wav", "ogg", "m4a"];

function NumberField({
  id,
  label,
  suffix,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  suffix: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="mt-1 flex items-baseline gap-1.5">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isFinite(n) ? n : min);
          }}
          className="h-9 w-[76px] rounded-lg border border-input bg-card px-2.5 text-[13px] tabular-nums text-foreground outline-none focus-visible:border-ring"
        />
        <span className="text-[12px] text-muted-foreground">{suffix}</span>
      </span>
    </label>
  );
}

/**
 * The break, said in minutes and seconds over one stored value.
 *
 * A twenty-second break is the rule this app exists for, so seconds cannot go away; a long break
 * is why somebody types "5" and not "300". Two boxes keep both honest and ask nobody to multiply.
 */
function BreakField({
  id,
  seconds,
  onChange,
}: {
  id: string;
  seconds: number;
  onChange: (total: number) => void;
}) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  const set = (m: number, s: number) => onChange(Math.min(3600, Math.max(0, m * 60 + s)));
  const box =
    "h-9 rounded-lg border border-input bg-card px-2.5 text-[13px] tabular-nums text-foreground outline-none focus-visible:border-ring";

  return (
    <div className="block">
      <span className="text-[12px] text-muted-foreground">Nghỉ</span>
      <span className="mt-1 flex items-baseline gap-1.5">
        <input
          id={`${id}-phut`}
          type="number"
          min={0}
          max={60}
          value={minutes}
          aria-label="Số phút nghỉ"
          onChange={(e) => {
            const n = Number(e.target.value);
            set(Number.isFinite(n) ? Math.min(60, Math.max(0, Math.round(n))) : 0, rest);
          }}
          className={`${box} w-[58px]`}
        />
        <span className="text-[12px] text-muted-foreground">phút</span>
        <input
          id={`${id}-giay`}
          type="number"
          min={0}
          max={59}
          value={rest}
          aria-label="Số giây nghỉ"
          onChange={(e) => {
            const n = Number(e.target.value);
            set(minutes, Number.isFinite(n) ? Math.min(59, Math.max(0, Math.round(n))) : 0);
          }}
          className={`${box} w-[58px]`}
        />
        <span className="text-[12px] text-muted-foreground">giây</span>
      </span>
    </div>
  );
}

export default function Settings() {
  const [multi, setMulti] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(DEFAULT_SESSIONS);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [strict, setStrict] = useState(false);
  const [actions, setActions] = useState(true);
  const [media, setMedia] = useState<Media>({});
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [autoStart, setAutoStart] = useState(false);
  const [saving, setSaving] = useState(false);

  const refreshMedia = useCallback(async () => {
    const [img] = await Promise.all([
      invoke<string | null>("media_path", { kind: "image" }),
    ]);
    setImagePath(img);
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      const store = await openStore();
      const stored = sanitizeSessions(await store.get<Session[]>(K.schedule));
      setSessions(stored);
      setMulti(stored.length > 1);
      setStrict((await store.get<boolean>(K.strict)) ?? false);
      setActions((await store.get<boolean>(K.actions)) ?? true);
      setText((await store.get<string>(K.text)) ?? DEFAULT_TEXT);
      setMedia((await store.get<Media>(K.media)) ?? {});
      void refreshMedia();
      try {
        setAutoStart(await isEnabled());
      } catch {
        /* the autostart plugin is desktop-only */
      }
    };
    void loadSettings();
  }, [refreshMedia]);

  const persist = async (
    nextSessions: Session[],
    nextStrict: boolean,
    nextText: string,
    nextMedia: Media,
    nextActions: boolean
  ) => {
    const clean = sanitizeSessions(nextSessions);
    const store = await openStore();
    await store.set(K.schedule, clean);
    await store.set(K.strict, nextStrict);
    await store.set(K.text, nextText);
    await store.set(K.media, nextMedia);
    await store.set(K.actions, nextActions);
    await store.save();
    // Rust owns the clock, so the schedule has to reach it too; a failure here is
    // reported rather than swallowed, because the screen would otherwise claim a
    // change that never reached the countdown.
    await invoke("set_schedule", { sessions: clean, strict: nextStrict });
  };

  const save = async () => {
    setSaving(true);
    try {
      await persist(sessions, strict, text, media, actions);
      // Show what the store kept, not what was typed: a 0-minute 0-second break is saved as the
      // 5-second floor, and a screen that kept printing 0 would be claiming otherwise.
      setSessions(sanitizeSessions(sessions));
      toast.success("Đã lưu cài đặt");
    } catch (error) {
      console.error(error);
      toast.error("Chưa lưu được cài đặt");
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const picked = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "Ảnh hoặc GIF", extensions: IMAGE_EXT }],
    });
    if (typeof picked !== "string") return;
    try {
      const name = await invoke<string>("import_media", {
        kind: "image",
        source: picked,
      });
      const next = { ...media, image: name };
      setMedia(next);
      await persist(sessions, strict, text, next, actions);
      await refreshMedia();
      toast.success("Đã đặt hình nền");
    } catch (error) {
      toast.error(String(error));
    }
  };

  const clearImage = async () => {
    await invoke("clear_media", { kind: "image" });
    const next = { ...media };
    delete next.image;
    setMedia(next);
    await persist(sessions, strict, text, next, actions);
    await refreshMedia();
  };

  const pickSound = async (kind: "soundStart" | "soundEnd") => {
    const picked = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "Âm thanh", extensions: SOUND_EXT }],
    });
    if (typeof picked !== "string") return;
    try {
      const name = await invoke<string>("import_media", { kind, source: picked });
      const next = { ...media, [kind]: name } as Media;
      setMedia(next);
      await persist(sessions, strict, text, next, actions);
      toast.success("Đã đặt âm thanh");
    } catch (error) {
      toast.error(String(error));
    }
  };

  const toggleAutoStart = async (next: boolean) => {
    try {
      if (next) await enable();
      else await disable();
      setAutoStart(next);
    } catch (error) {
      console.error(error);
      toast.error("Chưa đổi được chế độ tự chạy");
    }
  };

  const setSession = (i: number, patch: Partial<Session>) => {
    setSessions((prev) => prev.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  };

  const toggleMulti = (next: boolean) => {
    setMulti(next);
    if (!next) setSessions([sessions[0] ?? DEFAULT_SESSIONS[0]]);
  };

  return (
    <div className="mx-auto max-w-[620px] pb-10">
      <h1 className="text-[15px] font-medium text-foreground">Cài đặt</h1>

      <section className="mt-6 border-t border-border pt-5">
        <Toggle
          id="multi"
          checked={multi}
          onChange={toggleMulti}
          label="Chia ngày thành nhiều phiên"
          description="Mỗi phiên có thời gian làm việc và thời gian nghỉ riêng, lặp lại theo vòng."
        />

        <div className="mt-4 space-y-2.5">
          {(multi ? sessions : sessions.slice(0, 1)).map((s, i) => (
            <div
              key={i}
              className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card px-4 py-3"
            >
              <span className="w-14 text-[12px] text-muted-foreground">
                Phiên {i + 1}
              </span>
              <NumberField
                id={`work-${i}`}
                label="Làm việc"
                suffix="phút"
                value={s.workMinutes}
                min={1}
                max={600}
                onChange={(n) => setSession(i, { workMinutes: n })}
              />
              <BreakField
                id={`break-${i}`}
                seconds={s.breakSeconds}
                onChange={(total) => setSession(i, { breakSeconds: total })}
              />
              {multi && sessions.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setSessions(sessions.filter((_, k) => k !== i))}
                  className="mb-1 ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
                  aria-label={`Bỏ phiên ${i + 1}`}
                >
                  <X size={15} strokeWidth={1.5} />
                </button>
              ) : null}
            </div>
          ))}
        </div>

        {multi && sessions.length < MAX_SESSIONS ? (
          <button
            type="button"
            onClick={() =>
              setSessions([...sessions, { workMinutes: 30, breakSeconds: 300 }])
            }
            className="mt-2.5 text-[12px] text-primary transition-colors hover:underline"
          >
            Thêm phiên (tối đa {MAX_SESSIONS})
          </button>
        ) : null}
      </section>

      <section className="mt-6 border-t border-border pt-5">
        <label htmlFor="reminder-text" className="block">
          <span className="text-[13px] font-medium text-foreground">
            Câu hiện ra khi nghỉ
          </span>
          <input
            id="reminder-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 h-9 w-full rounded-lg border border-input bg-card px-2.5 text-[13px] text-foreground outline-none focus-visible:border-ring"
          />
        </label>
      </section>

      <section className="mt-6 border-t border-border pt-5">
        <Toggle
          id="actions"
          checked={actions}
          onChange={setActions}
          label="Đổi động tác mỗi lần nghỉ"
          description="Mỗi lần nghỉ hiện một động tác khác: nhìn ra xa, chớp mắt chậm, thả lỏng vai… Tắt thì luôn hiện câu chữ ở trên."
        />
      </section>

      <section className="mt-6 border-t border-border pt-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-[13px] font-medium text-foreground">
              Hình nền khi nghỉ
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
              Ảnh tĩnh hoặc GIF. Hình sẽ phóng to chậm để mắt có chỗ nhìn.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {imagePath ? (
              <button
                type="button"
                onClick={() => void clearImage()}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Bỏ hình nền"
              >
                <X size={15} strokeWidth={1.5} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void pickImage()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] text-foreground transition-colors hover:bg-secondary"
            >
              <ImageIcon size={14} strokeWidth={1.5} />
              Chọn ảnh
            </button>
          </div>
        </div>
        {imagePath ? (
          <img
            src={convertFileSrc(imagePath)}
            alt="Hình nền đang dùng"
            className="mt-3 h-24 w-full rounded-lg border border-border object-cover"
          />
        ) : null}
      </section>

      <section className="mt-6 border-t border-border pt-5">
        <div className="text-[13px] font-medium text-foreground">Âm thanh</div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
          Không chọn thì dùng tiếng chuông có sẵn.
        </p>
        <div className="mt-3 space-y-2">
          {(
            [
              { kind: "soundStart", label: "Khi bắt đầu nghỉ" },
              { kind: "soundEnd", label: "Khi nghỉ xong" },
            ] as const
          ).map(({ kind, label }) => (
            <div
              key={kind}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
            >
              <span className="text-[12px] text-foreground">{label}</span>
              <span className="flex items-center gap-2">
                <span className="max-w-[180px] truncate text-[11px] text-muted-foreground">
                  {media[kind] ?? "chuông mặc định"}
                </span>
                <button
                  type="button"
                  onClick={() => void pickSound(kind)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2 text-[11px] text-foreground transition-colors hover:bg-secondary"
                >
                  <Music4 size={13} strokeWidth={1.5} />
                  Chọn
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 border-t border-border pt-5">
        <Toggle
          id="strict"
          checked={strict}
          onChange={setStrict}
          label="Chế độ nghiêm khắc"
          description="Không có nút bỏ qua và không đóng được màn hình nhắc. Nếu bật, bạn sẽ không thoát ra được trong khoảng thời gian nghỉ đã chọn."
        />
      </section>

      <section className="mt-6 border-t border-border pt-5">
        <Toggle
          id="autostart"
          checked={autoStart}
          onChange={(next) => void toggleAutoStart(next)}
          label="Tự chạy khi mở máy"
          description="Bật để app có mặt ngay từ lúc đăng nhập, không phải nhớ mở."
        />
      </section>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="mt-7 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {saving ? "Đang lưu…" : "Lưu cài đặt"}
      </button>
    </div>
  );
}
