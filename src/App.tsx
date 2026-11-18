import { useEffect } from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Toaster } from "react-hot-toast";

import Layout from "./components/window/Layout";
import Settings from "./components/window/Settings";
import Today from "./components/window/Today";
import About from "./components/window/About";
import Reminder from "./components/window/Reminder";
import { openReminderWindow, startBreakNow } from "./lib/reminderWindow";
import { bumpBreaks } from "./lib/settings";

/**
 * The countdown runs in Rust and announces itself with `reminder-due`; this window only
 * reacts. Listening here rather than inside a settings screen matters: leaving that screen
 * would unmount it and silently drop the listener.
 *
 * The guard on the window label is not decoration. The reminder window loads this same
 * bundle, so without it every reminder would count itself twice and try to open a second
 * reminder on top of the first.
 */
function useReminderEvents() {
  useEffect(() => {
    if (getCurrentWebviewWindow().label !== "main") return;

    let stops: Array<() => void> = [];
    let cancelled = false;

    const wire = async () => {
      const offDue = await listen("reminder-due", () => {
        void bumpBreaks();
        void openReminderWindow();
      });
      // The tray's "Nghỉ ngay" entry. The window is opened from here because only this
      // side knows the reminder route; the same helper as the main screen's button, so a
      // manual break moves the schedule on however it was asked for.
      const offTray = await listen("nghi-ngay", () => {
        void startBreakNow();
      });
      if (cancelled) {
        offDue();
        offTray();
        return;
      }
      stops = [offDue, offTray];
    };
    void wire();

    return () => {
      cancelled = true;
      stops.forEach((stop) => stop());
    };
  }, []);
}

export default function App() {
  useReminderEvents();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Today />} />
          <Route path="cai-dat" element={<Settings />} />
          <Route path="gioi-thieu" element={<About />} />
        </Route>
        <Route path="/reminder" element={<Reminder />} />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))",
            border: "1px solid hsl(var(--border))",
            fontSize: "13px",
            borderRadius: "10px",
          },
        }}
      />
    </Router>
  );
}
