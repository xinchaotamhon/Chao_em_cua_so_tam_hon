use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU64, AtomicUsize, Ordering};
use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

const APP_NAME: &str = "Chào em cửa sổ tâm hồn";

/// Three is the owner's ceiling; more than that and nobody reads the list.
const MAX_SESSIONS: usize = 3;

/// A break picture or sound is copied next to the app, so this bounds what a user can
/// drop in. 100 MB covers a long GIF and stops a video from being smuggled in as one.
const MAX_MEDIA_BYTES: u64 = 100 * 1024 * 1024;
const IMAGE_EXTS: [&str; 5] = ["png", "jpg", "jpeg", "gif", "webp"];
const AUDIO_EXTS: [&str; 4] = ["mp3", "wav", "ogg", "m4a"];

/// One stretch of work and the break that follows it.
#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    work_minutes: u64,
    break_seconds: u64,
}

impl Default for Session {
    fn default() -> Self {
        Self {
            work_minutes: 20,
            break_seconds: 20,
        }
    }
}

impl Session {
    fn sanitized(self) -> Self {
        Self {
            work_minutes: self.work_minutes.clamp(1, 600),
            break_seconds: self.break_seconds.clamp(5, 3600),
        }
    }
}

/// The schedule, where in it the user is, and how far the current stretch has run.
///
/// Every counter is an atomic because the clock thread reads them once a second while
/// the settings screen writes them; the list itself needs the lock because it is not Copy.
struct ReminderState {
    sessions: Mutex<Vec<Session>>,
    index: AtomicUsize,
    generation: AtomicU64,
    elapsed: AtomicU64,
    strict: AtomicBool,
}

impl ReminderState {
    fn new(sessions: Vec<Session>, strict: bool) -> Self {
        Self {
            sessions: Mutex::new(sessions),
            index: AtomicUsize::new(0),
            generation: AtomicU64::new(0),
            elapsed: AtomicU64::new(0),
            strict: AtomicBool::new(strict),
        }
    }

    fn lock_sessions(&self) -> std::sync::MutexGuard<'_, Vec<Session>> {
        // A poisoned lock would mean the clock thread panicked. Refusing to start the
        // countdown again is worse than using the last known list, so the poison is
        // taken rather than unwrapped.
        self.sessions.lock().unwrap_or_else(|e| e.into_inner())
    }
}

/// One second of the countdown: the next elapsed count, and whether the reminder is due.
///
/// Pure on purpose. The clock itself lives in a thread that cannot run on a machine with
/// no desktop, so the arithmetic is separated out and covered by tests instead of being
/// left to "it compiled, so it must work".
fn tick(elapsed_seconds: u64, work_minutes: u64) -> (u64, bool) {
    let interval = work_minutes.max(1) * 60;
    let next = elapsed_seconds + 1;
    if next >= interval {
        (0, true)
    } else {
        (next, false)
    }
}

/// What the break screen is told when a reminder fires.
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DuePayload {
    break_seconds: u64,
    strict: bool,
}

/// What the main screen reads once a second to draw its one figure.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Snapshot {
    remaining_seconds: u64,
    work_seconds: u64,
    break_seconds: u64,
    session_index: usize,
    session_count: usize,
    strict: bool,
}

/// The countdown lives here, in Rust, and not in the webview.
///
/// A `setInterval` in the webview is throttled once its window is hidden or minimised -
/// which is the state this app sits in all day - so a JavaScript timer drifts and can
/// stop firing altogether. This thread wakes once a second, which costs nothing, and
/// emits `reminder-due` when the current stretch is up.
fn start_reminder_clock(app: AppHandle) {
    std::thread::spawn(move || {
        let mut elapsed: u64 = 0;
        let mut generation = app
            .state::<ReminderState>()
            .generation
            .load(Ordering::Relaxed);
        loop {
            std::thread::sleep(std::time::Duration::from_secs(1));
            let state = app.state::<ReminderState>();
            let current = state.generation.load(Ordering::Relaxed);
            if current != generation {
                generation = current;
                elapsed = 0;
                state.elapsed.store(0, Ordering::Relaxed);
                continue;
            }

            let (session, count) = {
                let list = state.lock_sessions();
                let count = list.len().max(1);
                let at = state.index.load(Ordering::Relaxed) % count;
                (list.get(at).copied().unwrap_or_default(), count)
            };

            let (next, due) = tick(elapsed, session.work_minutes);
            elapsed = next;
            state.elapsed.store(next, Ordering::Relaxed);

            if due {
                let at = (state.index.load(Ordering::Relaxed) + 1) % count;
                state.index.store(at, Ordering::Relaxed);
                let _ = app.emit(
                    "reminder-due",
                    DuePayload {
                        break_seconds: session.break_seconds,
                        strict: state.strict.load(Ordering::Relaxed),
                    },
                );
            }
        }
    });
}

/// Which session follows the one at `index`. A manual break moves on and wraps like the clock does.
fn next_index(index: usize, count: usize) -> usize {
    (index + 1) % count.max(1)
}

/// A break the user asked for: it ends the current stretch and moves the schedule on.
///
/// The alternative - open the break screen and let the countdown keep running - told the user two
/// different things at once, that the stretch was over and that it was not. The break length
/// returned belongs to the stretch that just ended, because that is the break the person is about
/// to take; the caller hands it to the break window so the two sides cannot disagree about which
/// session is running.
#[tauri::command]
fn take_break_now(state: tauri::State<ReminderState>) -> u64 {
    let (seconds, count, at) = {
        let list = state.lock_sessions();
        let count = list.len().max(1);
        let at = state.index.load(Ordering::Relaxed) % count;
        (
            list.get(at).copied().unwrap_or_default().break_seconds,
            count,
            at,
        )
    };
    state.index.store(next_index(at, count), Ordering::Relaxed);
    state.elapsed.store(0, Ordering::Relaxed);
    state.generation.fetch_add(1, Ordering::Relaxed);
    seconds
}

/// Replaces the whole schedule. Bumping the generation restarts the countdown, so a
/// setting the user just saved takes effect at once instead of after the old one drains.
#[tauri::command]
fn set_schedule(state: tauri::State<ReminderState>, sessions: Vec<Session>, strict: bool) {
    let mut clean: Vec<Session> = sessions
        .into_iter()
        .take(MAX_SESSIONS)
        .map(Session::sanitized)
        .collect();
    if clean.is_empty() {
        clean.push(Session::default());
    }
    *state.lock_sessions() = clean;
    state.strict.store(strict, Ordering::Relaxed);
    state.index.store(0, Ordering::Relaxed);
    state.elapsed.store(0, Ordering::Relaxed);
    state.generation.fetch_add(1, Ordering::Relaxed);
}

#[tauri::command]
fn reminder_snapshot(state: tauri::State<ReminderState>) -> Snapshot {
    let list = state.lock_sessions();
    let count = list.len().max(1);
    let index = state.index.load(Ordering::Relaxed) % count;
    let session = list.get(index).copied().unwrap_or_default();
    let work_seconds = session.work_minutes.max(1) * 60;
    let elapsed = state.elapsed.load(Ordering::Relaxed).min(work_seconds);
    Snapshot {
        remaining_seconds: work_seconds - elapsed,
        work_seconds,
        break_seconds: session.break_seconds,
        session_index: index,
        session_count: count,
        strict: state.strict.load(Ordering::Relaxed),
    }
}

/// Where the user's own break picture and sounds are kept: the app's local data folder,
/// never the folder the file came from. Copying means the app still works after the user
/// moves or deletes the original, and it keeps the asset scope to one directory.
fn media_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| e.to_string())?
        .join("media");
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn extension_of(path: &str) -> Option<String> {
    std::path::Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
}

fn allowed_for(kind: &str) -> Option<&'static [&'static str]> {
    match kind {
        "image" => Some(&IMAGE_EXTS),
        "soundStart" | "soundEnd" => Some(&AUDIO_EXTS),
        _ => None,
    }
}

/// Copies a file the user picked into the app's own media folder and returns its name.
///
/// The extension is checked against the slot rather than trusted, and the old file for
/// that slot is removed first so a stale picture can never be the one that wins.
#[tauri::command]
fn import_media(app: AppHandle, kind: String, source: String) -> Result<String, String> {
    let allowed = allowed_for(&kind).ok_or_else(|| format!("loại không hợp lệ: {kind}"))?;
    let ext = extension_of(&source).ok_or_else(|| "tệp không có phần mở rộng".to_string())?;
    if !allowed.contains(&ext.as_str()) {
        return Err(format!(".{ext} không được nhận cho mục này"));
    }

    let meta = std::fs::metadata(&source).map_err(|e| e.to_string())?;
    if !meta.is_file() {
        return Err("đường dẫn không phải một tệp".to_string());
    }
    if meta.len() > MAX_MEDIA_BYTES {
        return Err("tệp lớn hơn 100 MB".to_string());
    }

    let dir = media_dir(&app)?;
    if let Ok(entries) = std::fs::read_dir(&dir) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with(&format!("{kind}.")) {
                let _ = std::fs::remove_file(entry.path());
            }
        }
    }

    let name = format!("{kind}.{ext}");
    std::fs::copy(&source, dir.join(&name)).map_err(|e| e.to_string())?;
    Ok(name)
}

#[tauri::command]
fn clear_media(app: AppHandle, kind: String) -> Result<(), String> {
    let dir = media_dir(&app)?;
    if let Ok(entries) = std::fs::read_dir(&dir) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with(&format!("{kind}.")) {
                std::fs::remove_file(entry.path()).map_err(|e| e.to_string())?;
            }
        }
    }
    Ok(())
}

/// The absolute path of the file in a slot, or nothing when the user set none.
#[tauri::command]
fn media_path(app: AppHandle, kind: String) -> Option<String> {
    let dir = media_dir(&app).ok()?;
    let entries = std::fs::read_dir(&dir).ok()?;
    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with(&format!("{kind}.")) {
            return Some(entry.path().to_string_lossy().to_string());
        }
    }
    None
}

#[tauri::command]
fn check_minimized_argument() -> String {
    if std::env::args().any(|arg| arg == "--minimized") {
        "minimized".to_string()
    } else {
        "fullScreen".to_string()
    }
}

fn focus_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.set_skip_taskbar(false);
        let _ = window.show();
        let _ = window.set_focus();
    }
}

/// Reads what the user last saved, so the countdown starts on their schedule rather than
/// on a default the settings screen has to correct a second later.
fn saved_schedule(app: &AppHandle) -> (Vec<Session>, bool) {
    use tauri_plugin_store::StoreExt;
    let mut sessions = vec![Session::default()];
    let mut strict = false;
    if let Ok(store) = app.store("store.json") {
        if let Some(value) = store.get("chaoem.schedule") {
            if let Ok(list) = serde_json::from_value::<Vec<Session>>(value) {
                let clean: Vec<Session> = list
                    .into_iter()
                    .take(MAX_SESSIONS)
                    .map(Session::sanitized)
                    .collect();
                if !clean.is_empty() {
                    sessions = clean;
                }
            }
        }
        if let Some(value) = store.get("chaoem.strict") {
            strict = value.as_bool().unwrap_or(false);
        }
    }
    (sessions, strict)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // First, so a second launch is caught before anything else is built. Without it
        // the second copy dies silently with 0x800700AA and the user thinks the app is
        // broken; with it, the window they already have comes to the front.
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            focus_main(app);
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let handle = app.handle().clone();

            #[cfg(desktop)]
            {
                app.handle()
                    .plugin(tauri_plugin_autostart::init(
                        tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                        Some(vec!["--minimized"]),
                    ))
                    .expect("Failed to initialize autostart plugin");
            }

            let (sessions, strict) = saved_schedule(&handle);
            app.manage(ReminderState::new(sessions, strict));
            start_reminder_clock(handle.clone());

            // A failed notification must not kill the app, so the result is dropped
            // instead of unwrapped.
            use tauri_plugin_notification::NotificationExt;
            let _ = app
                .notification()
                .builder()
                .icon("icons/icon.png")
                .large_icon("icons/icon.png")
                .title(APP_NAME)
                .body("Đang chạy dưới khay hệ thống. Bấm vào biểu tượng ngôi sao cạnh đồng hồ để mở.")
                .show();

            let dashboard_i =
                MenuItem::with_id(app, "dashboard", "Trang chính", true, None::<&str>)?;
            let break_i = MenuItem::with_id(app, "break", "Nghỉ ngay", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Thoát", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&dashboard_i, &break_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } => focus_main(tray.app_handle()),
                    _ => {}
                })
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => app.exit(0),
                    "dashboard" => focus_main(app),
                    // The window itself is created by the webview, which is the only side
                    // that knows the reminder screen's route and its preview flag.
                    "break" => {
                        let _ = app.emit("nghi-ngay", ());
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_schedule,
            take_break_now,
            reminder_snapshot,
            import_media,
            clear_media,
            media_path,
            check_minimized_argument
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::{next_index, tick, Session};

    #[test]
    fn twenty_minutes_is_twelve_hundred_ticks() {
        let mut elapsed = 0u64;
        for _ in 0..1199 {
            let (next, due) = tick(elapsed, 20);
            assert!(!due, "fired early at second {next}");
            elapsed = next;
        }
        let (next, due) = tick(elapsed, 20);
        assert!(due, "20 minutes must fire");
        assert_eq!(next, 0, "the count restarts after firing");
    }

    #[test]
    fn the_interval_is_never_zero() {
        // A stored 0 must behave as one minute, not fire every second.
        assert_eq!(tick(58, 0), (59, false));
        assert_eq!(tick(59, 0), (0, true));
    }

    #[test]
    fn a_longer_interval_waits_longer() {
        let mut elapsed = 0u64;
        let mut fired = 0;
        for _ in 0..3600 {
            let (next, due) = tick(elapsed, 30);
            elapsed = next;
            if due {
                fired += 1;
            }
        }
        // 30 minutes is 1800 ticks, so one hour is exactly two reminders.
        assert_eq!(fired, 2);
    }

    #[test]
    fn a_session_keeps_its_own_two_lengths() {
        // The three-session feature exists because 20/5 and 30/10 are not the same
        // schedule with a different interval; each row must survive sanitizing intact.
        let session = Session {
            work_minutes: 30,
            break_seconds: 600,
        }
        .sanitized();
        assert_eq!(session.work_minutes, 30);
        assert_eq!(session.break_seconds, 600);
    }

    #[test]
    fn absurd_values_are_pulled_back_into_range() {
        let session = Session {
            work_minutes: 0,
            break_seconds: 1,
        }
        .sanitized();
        assert_eq!(session.work_minutes, 1, "a zero-minute session must not spin");
        assert_eq!(session.break_seconds, 5, "a 1-second break is not a break");
    }

    #[test]
    fn a_manual_break_moves_on_and_wraps() {
        // "Nghỉ ngay" is the user saying this stretch is over, so it must land on the next
        // session and come back round to the first, exactly as the clock's own firing does.
        assert_eq!(next_index(0, 3), 1);
        assert_eq!(next_index(1, 3), 2);
        assert_eq!(next_index(2, 3), 0);
        // One session is the ordinary case: the same session starts again, it does not vanish.
        assert_eq!(next_index(0, 1), 0);
    }
}
