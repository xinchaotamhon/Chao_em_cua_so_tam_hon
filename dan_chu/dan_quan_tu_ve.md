Role: HOW (BLOCK) - what this block is, what is inside it, how it runs. LOCAL, English.

# dan_quan_tu_ve - bao_ve_cua_so_tam_hon

Updated: 2026-11-21 | Scope: purpose, contents and running flow of `van_lang\bao_ve_cua_so_tam_hon`.

Read by an AI when this project is selected; the owner reads the project through this file.

Human: install `src-tauri\target\release\bundle\nsis\Chào em cửa sổ tâm hồn_2.1.4_x64-setup.exe` once from a normal folder (not from inside this workspace - see `hau_can.md` on the low-integrity label); the app then sits in the tray and interrupts on the schedule the owner set.
Engine: code - a Tauri desktop app on this machine; the countdown, the break screen and the media all run locally with no model and no network.
Licence: MIT - permissive

## Purpose and consumer

**What this project is, in one breath.** **Chào em cửa sổ tâm hồn** `2.1.4`, a Vietnamese eye-care
reminder for Windows, forked from `nomandhoni-cs/blink-eye` at its last MIT commit `0e440e7c9e`
(v1.6.0, 2024-11-07), rebuilt in the owner's own way, and published at
`github.com/xinchaotamhon/Chao_em_cua_so_tam_hon` so anyone can install it.

**The real problem it solves.** Long screen sessions dry and strain the eyes. The 20-20-20 rule -
every 20 minutes, look at something 20 feet away for 20 seconds - is the cheapest known counter, and
nobody follows it without something that interrupts them. This app lives in the system tray, counts
the minutes, and takes over the screen for the break with one instruction to look away.

Consumer: the owner first, then any person who installs it. The owner decides what the app says and
how it looks; this file and `hau_can.md` are how the next session learns what is true.

## The core idea

A reminder works only if it interrupts, and it is obeyed only if it is worth looking at. So the app
takes the whole screen - a notification is what people ignore - and that one screen is the only place
the product spends colour: a calm dark field, one gold ring emptying, one drawing of the movement the
break asks for, one sentence, nothing to click. Everything around it stays quiet.

The drawing is there because the owner said a sentence alone is not visual. Each of the five actions
gets a few lines of SVG with SMIL animation in `BreakIllustration.tsx`, drawn rather than imported,
and the n-th break of the day takes the n-th action so the five cycle through the day.

## The design, and where every value comes from

The world is **looking out of a window in the early morning**: giấy dó paper, chàm indigo, đồng
bronze. Three text roles, one chrome accent, one moment colour, and nothing else. The values live in
`src\theme.css`; the rules that keep them coherent are the nine passes of the `unslop` method, credited
in the app's About screen.

| Element | Value | Why |
| --- | --- | --- |
| Chrome accent | chàm `hsl(212 39% 30%)`, dark mode an off-white button | one accent, used rarely; on a dark theme an off-white button reads more deliberate than a coloured one |
| Moment colour | đồng `hsl(43 67% 47%)` | the drum star, the countdown ring, and nothing else |
| Type | Be Vietnam Pro 400/500, subsets latin + latin-ext + vietnamese, 92 KB | drawn for Vietnamese; the previous `Segoe UI` stack dropped and crowded stacked diacritics |
| Icons | lucide, 16-18 px, stroke 1.5, one colour | one set, one size, never their own colour |
| Mark | the Đông Sơn drum star, eight points | `src\lib\star.ts` draws it; `src-tauri\app-icon.svg` is the same geometry, and `tauri icon` derives all 17 sizes from it |
| Words over a picture | `#f5f0e6`, and the same at 75 % for the small line | the theme's ink is dark in light mode, and the owner's own photograph turned the break sentence into a smudge until the colour stopped following the theme |

Eight points rather than the drum's fourteen because the tray shows it at 16 px, where fourteen
points turn to mush.

## What is inside dan_chu, and what stays native

| Entry | Role |
| --- | --- |
| `dan_quan_tu_ve.md` | View 3: this file |
| `hau_can.md` | Why this commit, what was kept and cut, dependencies, rebuild steps, verified evidence, open limits |
| `system_prompt.md` | This project's own small View 2: what the project adds to the master law, and the `Master:` line that points at it |
| `CONSTRUCTION.md` | View 1: the product, the person it serves, and how it is built and installed |
| `preview-hinh.mjs` | Renders the five break drawings to a PNG with the browser already on this machine, so a redrawn figure can be looked at without building the app; it bundles the real component, never a copy of it |
| `dong-goi-store.ps1` | Packs the release exe into an MSIX for the Microsoft Store with `lac_hong\rung_ngap_man\msix`; the identity pair comes from Partner Center |

Everything else in `van_lang\bao_ve_cua_so_tam_hon` is the project's own software. The web side is
23 files:

| Path | What it is |
| --- | --- |
| `src\main.tsx` | entry; imports the font and `theme.css`, mounts `ThemeProvider` |
| `src\theme.css` | the `@tailwind` directives and every design token |
| `src\App.tsx` | routes and the two Tauri listeners (`reminder-due`, `nghi-ngay`) |
| `src\components\window\` | `Layout` (the rail), `Today`, `Settings`, `About`, `Reminder` |
| `src\components\BreakIllustration.tsx` | the five break drawings, one SVG each, animated with SMIL |
| `src\components\StarMark.tsx`, `StarRing.tsx`, `Toggle.tsx`, `ThemeProvider.tsx`, `DefaultStartMinimize.tsx` | the five shared pieces |
| `src\lib\` | `app.ts` (name and URLs), `actions.ts` (the five break actions and which break takes which), `settings.ts` (store keys, sessions, the break counter), `star.ts` (the star geometry), `reminderWindow.ts` |
| `src\hooks\useTimeCount.ts` | screen time per local day |
| `src\assets\chuong-mo.wav`, `chuong-tan.wav` | the two default chimes, generated as 16-bit mono WAV |

The Rust side is `src-tauri\src\lib.rs` and `src-tauri\src\main.rs`. `src-tauri\app-icon.svg` is the
mark the icon set is generated from.

`tai_lieu\` is what a person other than the owner receives: the install guide and the zip that
carries it. Both must be rebuilt whenever the build they describe changes.

`website\` - 63 files, 12,122,157 bytes of the upstream marketing site - is still frozen; nothing in
the app imports it and `hau_can.md` records that it is uncut.

## How to run it: entry, input, output, failure

The Rust toolchain is the shared parent block `lac_hong\rung_ngap_man\rust`; the npm packages are
installed inside the project. The build entry is:

```powershell
$env:CARGO_HOME  = "D:\nguyen_ai_dan\lac_hong\rung_ngap_man\rust\cargo"
$env:RUSTUP_HOME = "D:\nguyen_ai_dan\lac_hong\rung_ngap_man\rust\rustup"
$env:TMP = $env:TEMP = "D:\nguyen_ai_dan\van_lang\bao_ve_cua_so_tam_hon\.toolchain\tmp"
$env:npm_config_cache = "D:\nguyen_ai_dan\van_lang\bao_ve_cua_so_tam_hon\.toolchain\tmp\npm-cache"
$env:PATH = "D:\nguyen_ai_dan\lac_hong\rung_ngap_man\rust\cargo\bin;$env:PATH"
cd D:\nguyen_ai_dan\van_lang\bao_ve_cua_so_tam_hon
npm run tauri build
```

`dan_chu\rust.cmd` in that block sets `CARGO_HOME`, `RUSTUP_HOME` and `PATH` from its own location, so
a session that only compiles can call `dan_chu\rust.cmd cargo check` instead of setting them by hand.

The toolchain moved there on 2026-11-20 (the change `Y-054` tracked, closed 2026-11-21): 19,853 files /
1,637,893,286 B now serve every Rust consumer on this machine instead of one child, and this project's
`.toolchain\cargo` and `.toolchain\rustup` were deleted on 2026-11-21, after the build was proved green
and the owner gave the word. `.toolchain\tmp` stays, because `TMP`, `TEMP` and the npm cache still point
at it; the old `rustup-init.exe` installer is still beside it.

Output is a tray icon and, when a stretch of work ends, a full-screen break window. The build produces
`src-tauri\target\release\chao-em-cua-so-tam-hon.exe` and one installer in
`...\bundle\nsis\Chào em cửa sổ tâm hồn_2.1.4_x64-setup.exe`.

## Publishing

Two routes ship the same exe. `tai_lieu\ChaoEmCuaSoTamHon-<version>-CaiDat.zip` is the NSIS installer for
people who download it, and it carries the SmartScreen box. `tai_lieu\ChaoEmCuaSoTamHon-<version>-x64.msix`
is the same exe packed for the Microsoft Store by `dan_chu\dong-goi-store.ps1`, which calls
`lac_hong\rung_ngap_man\msix`; only the Store can sign it, so it is never installable by hand. The
step-by-step for the owner is `tai_lieu\HUONG_DAN_NOP_STORE.md`, and the source is
`github.com/xinchaotamhon/Chao_em_cua_so_tam_hon`.

The countdown runs in Rust (`src-tauri\src\lib.rs`), not in the webview: a thread wakes once a second
and emits `reminder-due`. Chromium throttles chained timers in a page hidden for more than five minutes
down to one check per minute, and a hidden window is what this app is all day, so a JavaScript clock
would land late. `cargo test --lib` covers the counting arithmetic and runs without a desktop.

The schedule is a list of up to three sessions, each `{ workMinutes, breakSeconds }`, so
"20 phút rồi nghỉ 5 phút, 30 phút rồi nghỉ 10 phút" is one list rather than a second mode. One session
in the list is the ordinary single-interval case. The break is entered as minutes and seconds over that
one stored number of seconds - the twenty-second rule stays typeable, and a five-minute break does not
have to be converted by hand. `set_schedule` replaces the list and bumps a
generation counter, which restarts the countdown so a saved change takes effect at once.

A break the user asks for - "Nghỉ ngay", on the main screen or in the tray - is the same statement as
the clock firing: the stretch is over. So `take_break_now` moves the schedule to the next session,
zeroes the elapsed count and returns the break length of the session that just ended, and the caller
opens the break window with that length (`?giay=<n>`). It deliberately does not increase "Số lần nhắc
hôm nay", which counts the reminders the app raised.

The source lives at `github.com/xinchaotamhon/Chao_em_cua_so_tam_hon`; `.gitignore` keeps the
toolchain, the build output, the delivery archives and `website\` out of it, so the repository is the
product and not upstream's marketing site.

Failure is explicit and each cause is recorded in `hau_can.md`: a missing Rust toolchain stops the
`cargo` step; a `%TEMP%` the linker cannot write stops linking with `LNK1104`; a folder carrying a Low
Mandatory Level label stops window creation with `Access is denied` and stops the installer from
writing to `%LOCALAPPDATA%`; and a Tauri plugin left registered after its config is deleted panics the
app at startup.

## Acceptance

- The tree matches commit `0e440e7c9e` except for changes this project deliberately makes, and every
  deliberate change is listed in `hau_can.md`.
- The MIT notice stays in `LICENSE.txt` and `src-tauri\LICENSE.txt`, and `bundle.license` stays
  `MIT`. That is what makes "everyone can install it" legal, and it is not negotiable.
- No updater points anywhere. The update button opens the project's own releases page in the browser
  and the app never downloads or runs anything by itself.
- No network request leaves the app unless the owner names the endpoint and the reason.
- Every screen a user reads is Vietnamese, and the owner has seen it.
- `npm run tauri build` runs to `exit=0`, and an installer is built and installed once on a machine
  with a desktop, with the real command and its real output pasted into `hau_can.md`.
- A person who receives the installer is not left guessing about the Windows warning: either the file
  reaches them without one, or the guide explains it before they see it.

As of 2026-11-17 the build criterion is met, four screens have been photographed and looked at (Today,
Settings, About and the break screen at 1920x1080), and the reminder has fired on its own: with a
one-minute schedule in the store, the break window appeared 60 seconds after launch. What is still
unproven is everything the user drives by hand - the file picker, a custom picture or sound playing
back through the asset protocol, strict mode against a real `Alt+F4`, the tray's "Nghỉ ngay" entry,
and a three-session cycle. The signature criterion is met by decision, not by certificate: the owner
chose not to buy one because the product is non-commercial, so a stranger downloading it will still
see the Windows warning and the guide is the whole answer to it.

## What an AI may change here

- Free: this file and `hau_can.md` inside `dan_chu`, and the project's own source tree for real work.
- Not without the owner: `website\`, the two licence files, the app's name and identifier, and the
  wording of anything a user reads on screen. The AI drafts Vietnamese; the owner decides it.
- Never: reintroduce the paywall, the licence server, or any updater endpoint.

Improvement: an AI may correct this file inside dan_chu; a change to its shape goes through khung_viet.md and the owner.

View 1 is `CONSTRUCTION.md`: the product, the person it serves, and how it is built and installed.
