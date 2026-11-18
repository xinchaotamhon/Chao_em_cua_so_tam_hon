import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getAllWindows } from "@tauri-apps/api/window";

/**
 * Mở màn hình nhắc toàn màn hình.
 *
 * Gọi lại khi cửa sổ nhắc đang mở thì không làm gì, thay vì lỗi vì trùng tên cửa sổ.
 * Đồng hồ đếm nằm trong Rust (`reminder-due`), không nằm ở đây.
 *
 * `manual` marks a break the user asked for. It never honours the strict setting: a setting that
 * traps someone who only wanted to look at the screen once would be a trap, not a feature.
 * `breakSeconds` comes from the manual path, because that break belongs to the stretch the user
 * just ended, and by then the snapshot already reports the next session.
 */
export async function openReminderWindow(manual = false, breakSeconds?: number): Promise<void> {
  const windows = await getAllWindows();
  if (windows.some((w) => w.label === "ReminderWindow")) return;

  const query = new URLSearchParams();
  if (manual) query.set("manual", "1");
  if (breakSeconds && breakSeconds >= 5) query.set("giay", String(breakSeconds));
  const search = query.toString();

  const webview = new WebviewWindow("ReminderWindow", {
    url: `/reminder${search ? `?${search}` : ""}`,
    fullscreen: true,
    alwaysOnTop: true,
    decorations: false,
    title: "Nghỉ mắt",
    skipTaskbar: true,
  });
  webview.once("tauri://error", (e) => {
    console.error("Không mở được cửa sổ nhắc:", e);
  });
}

/**
 * A break the user asked for, from the main screen or from the tray.
 *
 * Two things have to happen together or the screen and the clock disagree: Rust moves the schedule
 * on to the next session, and the break window opens for the length that belonged to the stretch
 * that just ended. Rust returns that length for exactly this reason.
 */
export async function startBreakNow(): Promise<void> {
  try {
    const seconds = await invoke<number>("take_break_now");
    await openReminderWindow(true, seconds);
  } catch (error) {
    console.error("Không bắt đầu được cử nghỉ:", error);
    await openReminderWindow(true);
  }
}
