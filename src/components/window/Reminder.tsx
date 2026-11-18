import { useEffect, useRef, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import StarRing from "../StarRing";
import StarMark from "../StarMark";
import BreakIllustration from "../BreakIllustration";
import { DEFAULT_TEXT, K, openStore, readBreaks, type Media } from "../../lib/settings";
import { actionForBreak, type BreakAction } from "../../lib/actions";
import chuongMo from "../../assets/chuong-mo.wav";
import chuongTan from "../../assets/chuong-tan.wav";

const appWindow = getCurrentWebviewWindow();

interface Snapshot {
  breakSeconds: number;
  strict: boolean;
}

/**
 * The break itself: full screen, one number, one sentence, and nothing to click.
 *
 * The countdown here is a plain interval and that is correct, unlike the one in the main
 * window: this window is visible and full screen, so the browser does not throttle it.
 */
export default function Reminder() {
  const params = new URLSearchParams(window.location.search);
  // A break the user asked for is marked `manual`; `preview` is the older name and still works.
  const manual = params.has("manual") || params.has("preview");
  // A manual break belongs to the stretch the user just ended, so the caller passes its length.
  // The snapshot cannot be asked for it: by the time this window boots, the schedule has already
  // moved on and the snapshot answers for the next session.
  const passed = Number(params.get("giay") ?? "");
  const passedSeconds = Number.isFinite(passed) && passed >= 5 ? passed : null;

  const [total, setTotal] = useState(20);
  const [left, setLeft] = useState(20);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [action, setAction] = useState<BreakAction | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [soundStartSrc, setSoundStartSrc] = useState<string>(chuongMo);
  const [soundEndSrc, setSoundEndSrc] = useState<string>(chuongTan);
  const [strict, setStrict] = useState(false);

  const startRef = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const load = async () => {
      let seconds = passedSeconds ?? 20;
      try {
        const snap = await invoke<Snapshot>("reminder_snapshot");
        if (passedSeconds === null) seconds = Math.max(5, snap.breakSeconds);
        setStrict(manual ? false : snap.strict);
      } catch {
        /* fall back to the 20-second default */
      }
      setTotal(seconds);
      setLeft(seconds);

      const store = await openStore();
      setText((await store.get<string>(K.text)) ?? DEFAULT_TEXT);

      // Which action this break gets: the n-th break of the day takes the n-th entry, so the
      // list cycles through the day and survives a restart, because the counter is in the store.
      const useActions = (await store.get<boolean>(K.actions)) ?? true;
      if (useActions) {
        const soLan = await readBreaks();
        setAction(actionForBreak(soLan > 0 ? soLan : 1));
      }
      const stored = (await store.get<Media>(K.media)) ?? {};
      for (const kind of ["image", "soundStart", "soundEnd"] as const) {
        if (!stored[kind]) continue;
        const path = await invoke<string | null>("media_path", { kind });
        if (!path) continue;
        const src = convertFileSrc(path);
        if (kind === "image") setImageSrc(src);
        if (kind === "soundStart") setSoundStartSrc(src);
        if (kind === "soundEnd") setSoundEndSrc(src);
      }
    };
    void load();
  }, [manual, passedSeconds]);

  useEffect(() => {
    if (left <= 0) {
      endRef.current?.play().catch(() => {});
      const id = window.setTimeout(() => void appWindow.close(), 1400);
      return () => window.clearTimeout(id);
    }
    const id = window.setInterval(() => setLeft((n) => n - 1), 1000);
    return () => window.clearInterval(id);
  }, [left]);

  // Strict mode holds the window open. Alt+F4 and the taskbar still exist, so this is
  // "no way out on this screen", never "impossible to leave" - and the wording in the
  // settings screen says exactly that.
  useEffect(() => {
    if (!strict) return;
    let stop: (() => void) | undefined;
    void appWindow
      .onCloseRequested((event) => {
        if (left > 0) event.preventDefault();
      })
      .then((unlisten) => {
        stop = unlisten;
      });
    return () => stop?.();
  }, [strict, left]);

  const clock =
    total >= 60
      ? `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`
      : String(left);

  // A photograph behind the words is the one case the theme cannot answer for itself: in light
  // mode the ink is dark, so a bright picture swallows the sentence instead of framing it. The
  // wash above is dark, so the words on a picture are light - whichever theme the app is in.
  const strong = imageSrc ? "text-[#f5f0e6]" : "text-foreground";
  const soft = imageSrc ? "text-[#f5f0e6]/75" : "text-muted-foreground";

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      {imageSrc ? (
        <>
          <img
            src={imageSrc}
            alt=""
            className="nen-nghi absolute inset-0 h-full w-full object-cover"
            style={{ animationDuration: `${Math.max(12, total)}s` }}
          />
          {/* The centre is darkened hard so the countdown and the sentence stay readable, and
              the edges keep some of the picture. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 72% 62% at 50% 50%, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.66) 48%, rgba(0,0,0,0.30) 100%)",
            }}
          />
        </>
      ) : null}

      <div className="relative flex h-full flex-col items-center justify-center gap-6 px-8">
        <StarMark size={22} className="text-moment" />

        <StarRing progress={total > 0 ? left / total : 0} size={240} stroke={5} className="text-moment">
          <div className="text-center">
            <div className={`text-[60px] font-medium leading-none tabular-nums ${strong}`}>
              {clock}
            </div>
            <div className={`mt-2 text-[12px] ${soft}`}>
              {total >= 60 ? "phút : giây" : "giây"}
            </div>
          </div>
        </StarRing>

        {action ? (
          <BreakIllustration id={action.id} size={104} className="text-moment" />
        ) : null}

        <div className="flex flex-col items-center gap-2.5">
          {action ? (
            <span className="text-[12px] tracking-wide text-moment">{action.title}</span>
          ) : null}
          <p className={`max-w-[26ch] text-center text-[23px] font-normal leading-snug ${strong}`}>
            {action ? action.line : text}
          </p>
        </div>

        {!strict ? (
          <button
            type="button"
            onClick={() => void appWindow.close()}
            className={`text-[13px] underline-offset-4 transition-colors hover:underline ${soft}`}
          >
            Bỏ qua lần này
          </button>
        ) : null}
      </div>

      <audio ref={startRef} src={soundStartSrc} autoPlay />
      <audio ref={endRef} src={soundEndSrc} />
    </div>
  );
}
