Role: WHEN (VIEW 1) - what this product is, who it serves, and how it is built. LOCAL, English.

# CONSTRUCTION - bao_ve_cua_so_tam_hon

Updated: 2026-11-17 | Scope: the product, the person it serves, and the way it is built and installed.
Public: yes - a Vietnamese eye-care reminder released freely under MIT for anyone to install.

## What this product is, and who it serves

**Chào em cửa sổ tâm hồn** `2.1.2`: a Windows program that counts how long the screen has been in
use and takes the whole screen for a short break when a stretch of work ends. It serves one person
first - the owner, who sits at this machine all day - and then anyone who installs it.

The one question it answers for that person: *"nhắc tôi nghỉ mắt sau mỗi 20 phút, và đừng làm phiền
khi tôi đang họp."*

The answer has two halves. The reminder arrives because the countdown runs in Rust, not in a browser
timer that a hidden window would throttle. And it does not annoy, because the break is short, it can
be skipped unless the owner turned that off himself, and the main window closes to the tray rather
than quitting. The break itself is shown, not only said: each break carries a small moving drawing of
the movement it asks for, and a long break is entered in minutes rather than counted out in seconds.

## The domains it took, and why

None. The folders in this project are the product's own - `src`, `src-tauri`, `public`, `tai_lieu`,
`website` - not the skeleton's thirteen. Nothing here needs a domain of its own yet, and an unneeded
domain is not created.

It does lean on one thing the skeleton should hold and does not: a Rust toolchain. That toolchain
lives at `.toolchain\` inside this project, which the master map forbids, because a child never keeps
its own copy of something the parent can hold. `Y-054` in `dien_hong\y_tuong.md` is the plan to move
it to `lac_hong\rung_ngap_man\rust`; until then this file says so plainly instead of pretending the
rule holds.

## How it is built, released and installed

    npm run tauri build
      -> src-tauri\target\release\chao-em-cua-so-tam-hon.exe
      -> ...\bundle\nsis\Chào em cửa sổ tâm hồn_2.1.2_x64-setup.exe

The build needs `CARGO_HOME`, `RUSTUP_HOME`, `TMP`, `TEMP` and `npm_config_cache` pointed inside
`.toolchain\`; `hau_can.md` holds the exact block, because the build fails with `LNK1104` without it.

Installing means running that one setup file from a normal folder - never from inside
`D:\nguyen_ai_dan`, whose folders carry a low-integrity label that stops the installer writing to
`%LOCALAPPDATA%`. It lands in `%LOCALAPPDATA%\Chào em cửa sổ tâm hồn`, with a Start Menu shortcut and
an uninstall entry named `Chào em cửa sổ tâm hồn`. There is no service, no account and no network.

What the user receives is `tai_lieu\ChaoEmCuaSoTamHon-2.1.2-CaiDat.zip`: the setup file plus one
self-contained Vietnamese page that explains the Windows warning, names every setting as it appears
on screen, and says how to uninstall.

## What is not verified

- A custom picture now works end to end: the owner picked one himself on 2026-11-17, and the store
  holds `chaoem.media.image = "image.png"` with the 6 887 399 B file in the app's media folder. A
  custom **sound** has never been played back; only the two built-in chimes have been heard.
- The five break drawings have been looked at as a browser render of the real component
  (`dan_chu\preview-hinh.mjs`), and one of them - chớp mắt chậm - has been seen inside the running app
  at 1920x1080. The other four have not been seen in the app itself.
- Strict mode has not been tried against a real `Alt+F4`.
- The tray menu's "Nghỉ ngay" entry has not been clicked.
- A three-session schedule has not run a full cycle; only the single-session case has fired.
- The folder is still named `bao_ve_cua_so_tam_hon` while the product is `Chào em cửa sổ tâm hồn`.
  Renaming it would touch the guard's table C, `hau_can.md`, both `tinh_yeu_nuoc.md` rows and
  `y_tuong.md`, so it is left as a recorded mismatch for the owner to decide.
- `website\` - 63 files, 12,122,157 bytes of upstream's marketing site - is still in the tree,
  unused, waiting for a decision to cut it.

## Change log

- 2026-11-17: `2.1.2` - the break screen's words over a picture are now a fixed light tone whichever
  theme the app is in, because the owner found dark text on his bright background. `2.1.1` had
  redrawn figures 4 and 5 and had made the break typeable in minutes and seconds. Replaced
  `**Chào em cửa sổ tâm hồn** `2.1.0`: a Windows program that counts how long the screen has been in
  use...` with the `2.1.2` version of the same paragraph, added the sentence that the break is shown
  as well as said, moved the installer name to `2.1.2`, and replaced the first "not verified" bullet -
  which still claimed no picture had ever been played back - with what the owner's own test proved,
  plus one open item for the drawings inside the app.
- 2026-11-17: Rewrote `## What this product is, and who it serves` to name `Chào em cửa sổ tâm hồn`
  `2.1.0` and to answer the one plain question in two halves instead of one.
- 2026-11-17: Replaced `None yet. The folders in this project are the product's own (src, src-tauri,
  public, dist, tai_lieu, website), not the skeleton's thirteen.` with the entry above, which keeps
  "none" but records the Rust toolchain that breaks the parent/child rule and points at `Y-054`.
- 2026-11-17: Replaced the build paths `bao-ve-cua-so-tam-hon.exe` and
  `Bao Ve Cua So Tam Hon_1.0.0_x64-setup.exe` with `chao-em-cua-so-tam-hon.exe` and
  `Chào em cửa sổ tâm hồn_2.1.0_x64-setup.exe`, added the environment block and the low-integrity
  install warning, and named the zip the user actually receives.
- 2026-11-17: Replaced the whole `## What is not verified` paragraph, which still said the tray and
  reminder UI had never been seen, with the six open items that are true after the screens were
  photographed and the reminder was watched firing on its own.
- 2026-11-17: Replaced the `Improvement:` line, because the owner removed the per-change approval:
  it now says an AI may update this file and must log each change with the line it replaced.

Improvement: an AI may update this file without asking and logs each change here with the line it replaced; the one plain question about what the product is stays with the owner, or the person he names as its user.
