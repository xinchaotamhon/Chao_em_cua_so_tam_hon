Role: HOW (BLOCK) - what this block depends on and how to rebuild it. LOCAL, English.

# hau_can - bao_ve_cua_so_tam_hon

Updated: 2026-11-17 | Scope: why this commit, what was kept and cut, dependencies, rebuild steps,
verified evidence, and what stays unverified.
Upstream: github:nomandhoni-cs/blink-eye@0e440e7c9e6e3cb38b606c0c001d5cbce08b01c0

View 3: [dan_quan_tu_ve.md](dan_quan_tu_ve.md).

## What this block is

A fork of `nomandhoni-cs/blink-eye` taken at commit
`0e440e7c9e6e3cb38b606c0c001d5cbce08b01c0` (2024-11-07T06:42:45Z, package version 1.6.0), the last
commit before the author introduced the paywall. 194 files, 13,697,106 bytes. A Tauri 2 desktop app:
React 18 + Vite 5 + Tailwind 3 frontend, and a thin Rust shell (`src-tauri\src\lib.rs` 4,811 B,
`main.rs` 184 B - the tray, the autostart plugin, and Tauri's own template `greet` command).

## Identity and licence of the tree

The owner's goal is to publish the app so anyone can install it. The current tree (2.9.1) cannot be
used for that: six statements disagree about its licence and none clearly permits redistribution.

| Where | What it says |
| --- | --- |
| `LICENSE` (root, 2.9.1) | "GNU General Public License (GPL) v3 + Additional Commercial Use Restrictions", non-commercial only, containing an unfilled placeholder `([Your Name])`, and no GPL-3.0 body text at all |
| `package.json:11` (2.9.1) | `"license": "GPL-3.0-only"` |
| `src-tauri/LICENSE.txt` (2.9.1) | EULA: personal, non-commercial, single device, "may not redistribute or resell the Software without explicit written permission" |
| `src-tauri/LICENSE.md` (2.9.1) | The same EULA |
| `COMMERCIAL_LICENSE.txt` (2.9.1) | "proprietary and confidential" |
| `src-tauri/tauri.conf.json:58` (2.9.1) | "GPL v3 + Additional Commercial Restrictions" again |
| `src-tauri/tauri.conf.json:59` (2.9.1) | `"licenseFile": "LICENSE.txt"`, so the EULA is what ships inside the installers |
| GitHub API, 2026-11-11 | `spdx_id: NOASSERTION` - no recognised licence |

A first reading of this said GPL-3.0 section 10 settles it. That was wrong: section 10 is "Automatic
Licensing of Downstream Recipients"; the section on additional terms is section 7, and section 7 lets
a recipient remove a further restriction. So the grant is genuinely contradictory rather than
one-sided, and the honest conclusion is that redistribution of the current tree rests on no clear
permission. Written permission from the author is the only route to it, and this project does not
take that route.

The commit used here has no such ambiguity. At `0e440e7c9e`:

- root `LICENSE.txt` is verbatim MIT, 1,068 bytes, no GPL clause, no non-commercial clause
- `src-tauri/LICENSE.txt` is verbatim MIT, 1,068 bytes
- `src-tauri/tauri.conf.json` declares `"license": "MIT"` and `"licenseFile": "LICENSE.txt"`
- `README.md` presents MIT as the open-source grant and a separate commercial licence as an option
- no `crypto.rs`, no `premium_nudge.rs`, no `LicenseValidationComponent.tsx`, no `TrialRemaining.tsx`,
  no `ActivateLicense.tsx`, no `PremiumFeaturesContext.tsx`: there is no paywall to remove

One residue, stated rather than hidden: `COMMERCIAL_LICENSE.txt` ("proprietary and confidential")
exists at this commit too, as it does at every commit in the repository. It reads as the author's
paid option next to the MIT grant, not as a replacement for it. The MIT notice must be kept in any
release; if this project ever needs certainty beyond that, the author's written word is the answer.

Timeline measured from the GitHub API on 2026-11-11: Tauri appears at `56458ffb2c` (2024-10-29);
`src-tauri/LICENSE.txt` is added as MIT at `e155ceb360` (2024-11-01); the paywall starts at
`796ff9742d` (2024-11-07 07:09, adds `ActivateLicense.tsx`) and `d685edb3cd` (08:53); `src-tauri`
flips MIT to CC BY-NC-SA 4.0 at `46e5edc650` (19:04); the root flips MIT to GPL plus restrictions at
`fd5be1dd38` (2024-11-16 16:11); the file is renamed at `f70403b32f` (2024-11-25). The clean window is
narrow and `0e440e7c9e` sits immediately before it.

## Capabilities: kept and cut

Nothing has been cut yet beyond the two dead updater files and one empty capability. `website\` still
stands, because the trim waits until the app builds end to end, so that every removal can be checked
against a working baseline instead of guessed at.

Deliberate changes from commit `0e440e7c9e` so far:

| File | Change | Why |
| --- | --- | --- |
| `src-tauri\tauri.conf.json` | `"beforeDevCommand"` and `"beforeBuildCommand"` changed from `bun run dev` / `bun run build` to `npm run dev` / `npm run build` | Bun is not installed and the owner chose npm; leaving `bun` there makes every build fail on a missing command |
| `.gitignore` | appended `/.toolchain` | The Rust toolchain was a runtime inside this block, 0.8 GB of it at the time - it moved to `lac_hong\rung_ngap_man\rust` on 2026-11-20, and on 2026-11-21 the two old folders and then the old installer were deleted, so `.toolchain` holds `tmp` alone - and none of it may reach a published repository. `package-lock.json` is deliberately not ignored: it is the pin this project now owns |
| `src-tauri\tauri.conf.json` | `productName` "Blink Eye" to "Bao Ve Cua So Tam Hon"; `version` 1.6.0 to 1.0.0; `identifier` `com.blinkeye.app` to `vn.baovecuasotamhon.app`; window `title`, `copyright`, `publisher` and both descriptions rewritten; `createUpdaterArtifacts` false; `plugins.updater` deleted; `targets` "all" to `["nsis"]` | The product is the owner's, not the author's: the old identifier collides with upstream's install location, and the author's name does not belong on a fork. The updater pointed at upstream's releases and needed a private key this project does not have. MSI packaging fails on the Vietnamese metadata, and NSIS is the installer a Windows beginner expects anyway |
| `src-tauri\Cargo.toml` | package `Blink-Eye` to `bao-ve-cua-so-tam-hon`, lib `blink_eye_lib` to `bao_ve_cua_so_tam_hon_lib`, version 1.0.0, authors, description; `tauri-plugin-updater` removed | The binary name follows the crate, so the installed executable stops being `Blink-Eye.exe` |
| `src-tauri\src\main.rs` | `blink_eye_lib::run()` to `bao_ve_cua_so_tam_hon_lib::run()` | Follows the renamed lib |
| `src-tauri\src\lib.rs` | Tray menu and startup notification in Vietnamese; the notification's `.unwrap()` replaced by a dropped result; both updater plugin registrations removed | A failed notification must not kill the app. The plugin had to go with its config: leaving it registered panics at startup on a `null` config |
| `src-tauri\capabilities\default.json` | `"updater:default"` removed | The plugin is gone, so the permission refers to nothing |
| `src-tauri\capabilities\desktop.json` | deleted | Its only permission was `updater:default`; the file granted nothing else |
| `src\components\BlinkEyeUpdater.tsx`, `src\hooks\useAutoUpdater.tsx` | deleted | Dead once the updater left, and they imported the removed package |
| `src\components\app-sidebar.tsx` | Vietnamese labels; the `Search` and `Settings` entries removed; the `Get Premium` footer button removed | `Search` and `Settings` pointed at `#` and did nothing, and the premium button had no handler and no paid tier behind it - three dead controls on a beginner's first screen |
| `src\components\AutoStartToggle.tsx`, `ScreenOnTime.tsx`, `CurrentTime.tsx`, `ThemeToggle.tsx`, `ReminderStyles.tsx`, `window\Reminder.tsx`, `window\Settings.tsx`, `window\UsageTime.tsx` | every user-visible string in Vietnamese; `CurrentTime` switched from 12-hour with AM/PM to 24-hour | The product is Vietnamese-first. The clock change is a local convention, not a translation |
| `src\components\window\Dashboard.tsx` | `UpdateDialog` removed | The component it rendered was deleted |
| `index.html` | `lang="vi"`, Vietnamese title | The document language was wrong for every screen |
| `package.json` | name, version, `@tauri-apps/plugin-updater` removed | Same rename, and the package is no longer imported |

What the owner has already decided to remove, in this order, once the build is verified:

| Candidate | Size | Why it goes | How to get it back |
| --- | --- | --- | --- |
| `website\` | 63 files, 12,122,157 B | The upstream marketing site; nothing in the app imports it | `git show 0e440e7c9e:website` from a fresh clone of the upstream repository |
| `src-tauri\src\lib.rs` `greet` command | 2 lines | Tauri template leftover, unreachable from the UI | The same upstream commit |
| Unused `components\ui\` shadcn files | up to 99 KB in 2.9.1; to be measured here | Only some are imported by this app | `npx shadcn add <name>` or the upstream commit |
| `.github\` workflows | 4 files, 10,861 B | Upstream CI; this project has no GitHub remote yet | The upstream commit |
| Updater plugin and endpoint | — | Points at `nomandhoni-cs/blink-eye` releases signed with the author's key; a fork that keeps it replaces itself with the 2.9.1 EULA build | Re-add only against this project's own signing key |

Size of the tree by area, measured 2026-11-11:

```text
website      63 file(s)  12,122,157 B
src          49 file(s)     168,994 B
src-tauri    60 file(s)   1,247,049 B
public        2 file(s)       4,096 B
.github       4 file(s)      10,861 B
total       194 file(s)  13,697,106 B
```

## What it needs: runtime, versions, pins, external services

| Path or service | Record |
| --- | --- |
| `lac_hong\rung_ngap_man\node\node.exe` | Node 22.23.4, already here. Provides `npm` at `node\npm.ps1`; `node` is on `PATH` |
| Rust toolchain | **Installed 2026-11-11** at `.toolchain\` inside this project: `rustc 1.99.1 (58cf8f9c3 2026-10-13)`, `cargo 1.99.1 (5f94df478 2026-08-27)`, `stable-x86_64-pc-windows-msvc`, minimal profile. 167 files, 811,780,160 bytes. The first estimate here said ~1.3 GB; the measured figure is 0.8 GB |
| MSVC + Windows SDK | **Already present.** Visual Studio Build Tools 2022, MSVC 14.44.35207, Windows SDK 10.0.26100.0. The expensive half of a Rust install was already paid for, so no Visual Studio download was needed |
| WebView2 runtime | **Present**, 157.0.4341.46 - Tauri's runtime prerequisite is met |
| `bun` | **Absent, and deliberately not installed.** Upstream's flow is `bun install`, and the only lockfile here is `bun.lockb` (121,686 B). The owner chose npm: `npm install` resolved the `^` ranges and wrote its own `package-lock.json`, which is now the pin this project owns |
| `%LOCALAPPDATA%\npm-cache` | npm's default cache, **outside this session's sandbox**, which covers `D:\nguyen_ai_dan` only. It is redirected to `%TEMP%\npm-cache-dsh` for every npm command here |
| `%USERPROFILE%\.cargo`, `%USERPROFILE%\.rustup` | rustup's default install roots, also outside the sandbox. They were redirected into `.toolchain\` before rustup ran, so nothing was written to the user profile |
| Process spawn with piped stdio | **Blocked by this session's confinement.** A Node program that spawns a child and captures its output through a pipe fails with `EPERM`, which stops `vite build` (Node spawning `esbuild.exe`) and `tauri build` (Node spawning `cargo metadata`). Running `cargo` directly from PowerShell works. The owner approved one build run with the confinement lifted, and that is how the artifacts below were produced |
| `%TEMP%` for `link.exe` | The MSVC linker writes `lnk{...}.tmp` into `%TEMP%` and fails with `LNK1104` when it cannot. Pointing `TMP` and `TEMP` at `.toolchain\tmp` inside the project is what made the link step succeed; the first attempt without it failed on every build script |
| A desktop session | **Absent here.** `dwm`, `explorer`, `winlogon` and `csrss` are not visible in this session's process list, and no process has a window title. A GUI window cannot be created, so the app's window cannot be shown on this machine |
| `src-tauri\Cargo.toml` | `tauri = "2.0.6"`, `tauri-plugin-*` 2.x, `serde`, `serde_json`, `tauri-build 2.0.3` |
| `package.json` pins | `@tauri-apps/api` 2.0.3, `@tauri-apps/cli` 2.0.4, `@tauri-apps/plugin-autostart` 2.0.0, `@tauri-apps/plugin-notification` 2.0.0, `@tauri-apps/plugin-shell` 2.0.1, `@tauri-apps/plugin-store` 2.1.0 |
| `https://codeload.github.com` | Where this tree came from, pinned by commit, never by branch |
| `https://registry.npmjs.org` | Where `npm install` fetches from |
| `https://static.rust-lang.org` | Where rustup and the toolchain come from |
| — | No licence server, no telemetry endpoint, no payment provider. At this commit the app makes no network request at all: `src-tauri\capabilities\default.json` grants no `http:` permission |

## How to rebuild it from nothing

1. Use the Rust toolchain from the shared parent block `lac_hong\rung_ngap_man\rust` (`rustc` and
   `cargo` `1.99.1`, `stable-x86_64-pc-windows-msvc`), which moved there on 2026-11-20. Only if that
   block is gone: `rustup-init.exe` (12.2 MB) from
   `https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe`, run with
   `CARGO_HOME` and `RUSTUP_HOME` pointed at the block, which fetches the same stable toolchain. MSVC
   and the Windows SDK are already installed, so no Visual Studio download is needed.
2. Fetch the source at the pinned commit, never from a branch:
   `https://codeload.github.com/nomandhoni-cs/blink-eye/zip/0e440e7c9e6e3cb38b606c0c001d5cbce08b01c0`
   (12,992,721 bytes, SHA-256 `B429BD3DA4073888555E57FC7208D1089F641D483673DD1CF34F42442DAFB8B1`),
   then flatten the single `blink-eye-<sha>\` root into the project folder.
3. Prove the tree before trusting it: hash every file as a git blob and compare with
   `https://api.github.com/repos/nomandhoni-cs/blink-eye/git/trees/0e440e7c9e...?recursive=1`. The
   expected verdict is `matched 194, differ 0, only-local 0, only-upstream 0`.
4. Install the frontend dependencies with the cache redirected, and without lifecycle scripts, which
   is what works under this session's confinement:

   ```powershell
   $env:npm_config_cache = Join-Path $env:TEMP "npm-cache-dsh"
   cd D:\nguyen_ai_dan\van_lang\bao_ve_cua_so_tam_hon
   npm install --ignore-scripts --no-audit --no-fund
   ```

   `--ignore-scripts` is safe here rather than a shortcut: esbuild ships its platform binary as the
   optional dependency `@esbuild/win32-x64`, and that binary was verified present afterwards. The
   only thing skipped is the postinstall check that the sandbox refuses to spawn.
5. Build. `npm run build` and `npm run tauri build` both need Node to spawn a child with piped stdio,
   which this session's confinement blocks, so under the current sandbox neither can run. With the
   confinement lifted, `npm run tauri build` produces the installer in
   `src-tauri\target\release\bundle\`. `cargo build --release` invoked directly from PowerShell works
   around half of it, but `tauri::generate_context!()` embeds `../dist`, so the frontend must be built
   first and that is the blocked half.
6. Before any release: remove the updater endpoint and `createUpdaterArtifacts`, or point them at this
   project's own key. Remove `website\`. Keep both MIT licence files and `"license": "MIT"`.

## The reminder clock is in Rust

The 20-minute countdown used to be a `setInterval` inside the dashboard's JavaScript. Chromium, and
therefore WebView2, applies "intensive throttling" to chained timers in a page that has been hidden for
more than five minutes and silent for thirty seconds: "the browser will check timers in this group once
per **minute**" (`developer.chrome.com/blog/timer-throttling-in-chrome-88`). A hidden window is exactly
what this app is all day, so a 20-minute reminder was being checked at most once a minute and could
land late. It now lives in `src-tauri\src\lib.rs`: a thread wakes once a second, and when the interval
is up it emits `reminder-due`. `src\App.tsx` listens and opens the window through
`src\lib\reminderWindow.ts`. The webview no longer counts anything.

A first version of this note said the timer "could stop firing altogether". That was wrong: throttling
slows the chain to one check per minute, it does not stop it. The reason to move the clock is accuracy,
not survival.

Saving a new interval bumps a generation counter, which restarts the countdown at once instead of
after the old interval has drained. The counting arithmetic is a pure function, `tick`, so it is
covered by unit tests rather than left to "it compiled".

Two JavaScript timers remain and both are acceptable: the countdown drawn inside the reminder window,
which is fullscreen and visible, and the screen-on-time counter in `useTimeCount.ts`, which drives a
statistic and will undercount while the window is hidden.

## Getting past the Windows warning

The owner's requirement on 2026-11-13: a person who sees a warning will assume the app is malware and
stop. What the warning actually is, from Microsoft's own documentation read that day:

- SmartScreen warns when a downloaded file is not on its list of "well known and downloaded
  frequently" files, and it checks "the digital signature used to sign a file". With no reputation,
  "the item is marked as a higher risk and presents a warning".
  (`learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/`, updated 2026-04-23)
- The same page: "SmartScreen protects against malicious files from the internet. It doesn't protect
  against malicious files on internal locations or network shares, such as shared folders with UNC
  paths or SMB/CIFS shares." A file handed over a USB stick or a home network share carries no
  Mark-of-the-Web, so the warning never appears at all.
- A warning can be disputed by submitting the file at `https://www.microsoft.com/wdsi/filesubmission/`.
- Azure Artifact Signing, the renamed Trusted Signing service: "Public Trust certificates are
  available to organizations in the United States, Canada, the European Union, the United Kingdom,
  Australia, New Zealand, Japan, South Korea, Singapore, Switzerland, Norway, and Israel. Individual
  developers must be located in the United States or Canada." Vietnam is on neither list, so this
  route is **closed** to the owner as an individual in Vietnam.
  (`learn.microsoft.com/en-us/azure/artifact-signing/quickstart`, updated 2026-05-21)
- Microsoft Store developer accounts: with the onboarding flow at `storedeveloper.microsoft.com`
  "there are no registration fees for either account type", and an individual account verifies a
  government ID and a selfie.
  (`learn.microsoft.com/en-us/windows/apps/publish/partner-center/open-a-developer-account`, updated 2026-10-29)

The routes, cheapest first:

| Route | Cost | Removes the warning | Available now |
| --- | --- | --- | --- |
| Hand the file over USB or a LAN share | none | Yes - no Mark-of-the-Web, so SmartScreen never sees it | yes |
| Submit the installer to Microsoft for review | none | Sometimes, after review | yes, outcome not guaranteed |
| Microsoft Store, individual account | no registration fee; needs ID and selfie | Yes - the Store delivers and signs the package | not yet: it needs MSIX packaging this project does not produce |
| Commercial CA OV or EV certificate | paid, not priced here | Yes; EV at once, OV after reputation | needs buying, and a legal entity for OV or EV |
| Azure Artifact Signing | paid | Yes | **no** - Vietnam is not an eligible location |
| Wait for reputation | none | Eventually | not a plan |

For a stranger downloading from the internet there is no free way to remove the warning: only a
signature or the Store does it. For the owner's own circle a direct copy removes it today at zero
cost, and the installer guide now says so in its step 2.

## Verified, with the command and its real output

The zip the owner downloaded was screened at the station on 2026-11-11, and then moved out of
`van_lang` into the screening domain, where unscreened and screened downloads are kept:

```text
sang-loc.ps1 -Path ...\van_lang\bao_ve_cua_so_tam_hon\blink-eye-master.zip
unpacked blink-eye-master.zip -> %TEMP%\sang-loc-80edd45d...\blink-eye-master (temporary, deleted at the end)
folder   blink-eye-master
files    596 (23700997 bytes), 1 name-matched as secret and hashed only
         website/.env.example - contents never printed
repo     nomandhoni-cs/blink-eye
package  blink-eye
needs
  package-lock.json v2: 341 packages
  registries: registry.npmjs.org(341)
  install scripts: esbuild, fsevents
  platform packages: 28 in total, 2 for win32-x64: @rollup/rollup-win32-x64-msvc, @tauri-apps/cli-win32-x64-msvc
upstream
  nomandhoni-cs/blink-eye | default master | stars 264 | forks 19
  licence NOASSERTION | created 2024-01-29 | pushed 2026-11-07 | archived false
  master HEAD 3d0c9cacbb (2026-11-07T12:14:26Z) -> matched 596, differ 0, only-local 0, only-upstream 2
  VERDICT trimmed subset of commit 3d0c9cacbb712ec5df3711685dc351f9337ff0c2 on master
not checked
  nothing is installed, built or executed; no test was run; dependency sizes were not downloaded
exit=0
temporary folder removed: True
```

That zip, 20,657,022 bytes, SHA-256
`2599E2E71BDDF36438EC903B8BCDAE5558FD39F3476F37445A6F22CF127DAF40`, now sits at
`truong_sa_hoang_sa\duong_luoi_bo\blink-eye-master.zip`. Its hash is unchanged by the move, so it is
still the same artefact that was screened.

The fork was fetched and proved identical to the commit, 2026-11-11:

```text
url : https://codeload.github.com/nomandhoni-cs/blink-eye/zip/0e440e7c9e6e3cb38b606c0c001d5cbce08b01c0
http: 200 application/zip null
bytes: 12992721
sha256: B429BD3DA4073888555E57FC7208D1089F641D483673DD1CF34F42442DAFB8B1
zip roots: blink-eye-0e440e7c9e6e3cb38b606c0c001d5cbce08b01c0
entries  : 242
```

```text
local files   : 194 bytes 13697106
upstream blobs: 194 bytes 13697106 truncated false
VERDICT matched 194, differ 0, only-local 0, only-upstream 0
```

The licence and the paywall state were then read from the extracted files, not from the network:

```text
LICENSE.txt (root)   : "MIT License" ... length 1068 bytes
src-tauri/LICENSE.txt: "MIT License" ... length 1068 bytes
tauri.conf.json      : productName Blink Eye | version 1.6.0 | identifier com.blinkeye.app
                       bundle.license MIT | bundle.licenseFile LICENSE.txt
                       updater endpoints https://github.com/nomandhoni-cs/blink-eye/releases/latest/download/latest.json
                       csp (empty)
paywall files present: crypto.rs False | premium_nudge.rs False | LicenseValidationComponent.tsx False
                       TrialRemaining.tsx False | ActivateLicense.tsx False
src-tauri/src        : lib.rs 4811 | main.rs 184
```

The toolchain state of this machine, measured 2026-11-11:

```text
cargo   (not found)      rustc   (not found)      bun   (not found)
node    D:\nguyen_ai_dan\lac_hong\rung_ngap_man\node\node.exe   22.23.4
npm     D:\nguyen_ai_dan\lac_hong\rung_ngap_man\node\npm.ps1
WebView2 157.0.4341.46
Visual Studio Build Tools 2022 -> MSVC 14.44.35207, Windows SDK 10.0.26100.0
D: free 395.70 GB
rustup-init.exe (msvc x64)  HTTP 200  12.2 MB
Rust stable                 1.99.1 (2026-10-15)
```

The owner approved installing the toolchain on 2026-11-11. It went in with every root redirected
inside the project, so nothing was written to the user profile:

```text
downloaded 12839424 bytes
rustup-init.exe: 12839424 bytes
CARGO_HOME : ...\bao_ve_cua_so_tam_hon\.toolchain\cargo
RUSTUP_HOME: ...\bao_ve_cua_so_tam_hon\.toolchain\rustup
info: profile set to minimal
info: default host tuple is x86_64-pc-windows-msvc
info: syncing channel updates for stable-x86_64-pc-windows-msvc
info: latest update on 2026-10-15 for version 1.99.1 (58cf8f9c3 2026-10-13)
info: downloading 3 components
  stable-x86_64-pc-windows-msvc installed - rustc 1.99.1 (58cf8f9c3 2026-10-13)
rustc 1.99.1 (58cf8f9c3 2026-10-13)
cargo 1.99.1 (5f94df478 2026-08-27)
toolchain: 167 files, 0.8 GB on disk (apparent 811,780,160 B)
```

The first `npm install` attempt failed, and the reason is worth keeping because it will bite again:

```text
npm install --no-audit --no-fund
npm error code: 'EPERM'
npm error syscall: 'spawn'
node_modules exists : False
```

Running it without lifecycle scripts succeeded:

```text
npm install --ignore-scripts --no-audit --no-fund
added 202 packages in 1m
node_modules top-level entries : 121
package-lock.json              : True
esbuild win32 binary           : True
tauri cli                      : True
```

Both build paths are then refused by the same process boundary, which is the real state of this
project today:

```text
npm run tauri build
failed to get cargo metadata: Access is denied. (os error 5)

npm run build
> tsc && vite build
Error: spawn EPERM
    at ensureServiceIsRunning (...\node_modules\esbuild\lib\main.js:1975:29)
exit=1
dist exists: False
```

The same `cargo`, run straight from PowerShell instead of through a Node child process, answers
normally, which isolates the cause to the pipe rather than to the toolchain:

```text
cargo metadata --no-deps --format-version 1
{"packages":[{"name":"Blink-Eye","version":"1.6.0","id":"path+file:///D:/nguyen_ai_dan/van_lang/bao_ve_cua_so_tam_hon/src-tauri#Blink-Eye@1.6.0","license":null,...
```

One deliberate change to the tree was made before that build attempt, and it is the first entry of
the list in "Capabilities: kept and cut": `src-tauri\tauri.conf.json` had
`"beforeDevCommand": "bun run dev"` and `"beforeBuildCommand": "bun run build"`. Bun is not installed
and the owner chose npm, so both now read `npm run dev` and `npm run build`. No other upstream file
has been touched.

The frontend then compiled, with TypeScript 5.9.3 against code written for 5.2 - the risk recorded
below did not materialise:

```text
npm run build
> tsc && vite build
vite v5.4.21 building for production...
✓ 1704 modules transformed.
dist/index.html                   0.46 kB │ gzip:   0.29 kB
dist/assets/index-DjH3k8FI.css   36.82 kB │ gzip:   7.00 kB
dist/assets/index-DDwXjOWz.js   383.80 kB │ gzip: 122.07 kB
✓ built in 6.17s
frontend exit=0
dist exists: True
```

With `TMP` and `TEMP` pointed inside the project, the Rust side linked and both installers were
produced:

```text
npm run tauri build
   Compiling Blink-Eye v1.6.0 (...\bao_ve_cua_so_tam_hon\src-tauri)
    Finished `release` profile [optimized] target(s) in 5m 52s
    Built application at: ...\src-tauri\target\release\Blink-Eye.exe
    Info Target: x64
    Running light to produce ...\bundle\msi\Blink Eye_1.6.0_x64_en-US.msi
    Info Target: x64
    Running makensis.exe to produce ...\bundle\nsis\Blink Eye_1.6.0_x64-setup.exe
    Finished 2 bundles at:
        ...\bundle\msi\Blink Eye_1.6.0_x64_en-US.msi
        ...\bundle\nsis\Blink Eye_1.6.0_x64-setup.exe

A public key has been found, but no private key. Make sure to set `TAURI_SIGNING_PRIVATE_KEY` environment variable.
    Error A public key has been found, but no private key. ...
tauri exit=1
```

The artifacts, measured 2026-11-11:

| File | Bytes | SHA-256 |
| --- | --- | --- |
| `src-tauri\target\release\Blink-Eye.exe` | 15,640,576 | `C22A99863ED21F892902059603C34592A75ECF33EB41895FC00EDDE94E3AAE05` |
| `bundle\msi\Blink Eye_1.6.0_x64_en-US.msi` | 5,496,832 | `7CF397E51096940DB904E6EB691D74E2C6E7F17923E23368E4EEA0A4BB7298E8` |
| `bundle\nsis\Blink Eye_1.6.0_x64-setup.exe` | 3,798,467 | `B77A486B9DED893079D3776B0DCE05248135065F54B4ED36FB8BCD64EA924EAB` |

The trailing error is the updater trap this file warned about, now hit for real: `createUpdaterArtifacts`
is `true` and `plugins.updater.pubkey` is the author's, but no private key exists, so the signing step
fails after the bundles are written. `tauri exit=1` is that signing step, not the build.

The binary was then launched twice. It runs its Rust code and dies creating its window:

```text
thread 'main' panicked at ...\tauri-2.0.6\src\app.rs:1132:11:
Failed to setup app: Access is denied. (os error 5)
stack backtrace:
   ...
   4: <tauri_runtime_wry::Context<...>>::create_window::<...>
   8: blink_eye_lib::run
```

The cause is the machine, not the code. This session has no desktop:

```text
dwm        NOT running
explorer   NOT running
winlogon   NOT running
csrss      NOT running
```

So the window cannot be created here, and the user interface is **not** verified. What is verified is
that the tree compiles, links, bundles, and that the binary starts and reaches window creation.

The Vietnamese pass then changed the product name, identifier, crate name and about thirty strings,
and removed the updater. Two builds were needed to get it right, and the first failure is the reason
the removal list above is five files long instead of one:

```text
thread 'main' panicked at src\lib.rs:110:10:
error while running tauri application: PluginInitialization("updater",
  "Error deserializing 'plugins.updater' within your Tauri configuration:
   invalid type: null, expected struct Config")
```

Removing the `plugins.updater` block while leaving the plugin registered makes the app panic before
it ever reaches a window. After also removing the capability permission, the Cargo dependency, the
`lib.rs` registrations and the two dead components, the build is clean:

```text
npm run tauri build
   Compiling bao-ve-cua-so-tam-hon v1.0.0
    Finished `release` profile [optimized] target(s) in 1m 29s
    Built application at: ...\src-tauri\target\release\bao-ve-cua-so-tam-hon.exe
    Running makensis.exe to produce ...\bundle\nsis\Bao Ve Cua So Tam Hon_1.0.0_x64-setup.exe
    Finished 1 bundle at:
        ...\bundle\nsis\Bao Ve Cua So Tam Hon_1.0.0_x64-setup.exe
tauri exit=0
```

The binary was launched again afterwards. It now fails only at window creation, with the same
`Access is denied` at `tauri-2.0.6\src\app.rs:1132` as before, which is this machine having no
desktop and not a fault in the build.

Final artifacts, measured 2026-11-11:

| File | Bytes | SHA-256 |
| --- | --- | --- |
| `src-tauri\target\release\bao-ve-cua-so-tam-hon.exe` | 12,572,160 | `A152F9850D56814313C26EB1BFE2A049556555DB22615B28109BFED0DDC05458` |
| `bundle\nsis\Bao Ve Cua So Tam Hon_1.0.0_x64-setup.exe` | 2,832,834 | `FBF6C29354ED147636CBDBB554DC93F4A8E67643E02CB9478F4468CA0CF3C6C1` |
| `tai_lieu\BaoVeCuaSoTamHon-1.0.0-CaiDat.zip` (installer + guide) | 2,817,193 | `F231B7BE3361C0954EA8D308B53593F3D4638439019F31DD27567F498311B497` |

Removing the updater shrank the binary from 15,640,576 to 12,572,160 bytes and the installer from
3,798,467 to 2,832,834 bytes, because the updater pulled `reqwest`, `rustls` and their dependency
tree with it.

`tai_lieu\HUONG_DAN_CAI_DAT.html` (8,509 bytes) is the page handed to whoever installs the app. It
matches this build: the Vietnamese labels it names are the ones the app now shows, and the size and
SHA-256 it quotes are the row above.

### The Rust clock, 2026-11-13

The countdown moved from JavaScript to Rust and the arithmetic was tested rather than assumed:

```text
cargo test --lib
running 3 tests
test tests::a_longer_interval_waits_longer ... ok
test tests::the_interval_is_never_zero ... ok
test tests::twenty_minutes_is_twelve_hundred_ticks ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

That run needed no lifted confinement: `cargo` invoked straight from PowerShell works, which is the
same boundary recorded above for `cargo metadata`. The release build was then remade from the tested
source:

```text
npm run tauri build
   Compiling bao-ve-cua-so-tam-hon v1.0.0
    Finished `release` profile [optimized] target(s) in 2m 24s
    Finished 1 bundle at: ...\bundle\nsis\Bao Ve Cua So Tam Hon_1.0.0_x64-setup.exe
tauri exit=0
```

| File | Bytes | SHA-256 |
| --- | --- | --- |
| `src-tauri\target\release\bao-ve-cua-so-tam-hon.exe` | 12,590,592 | `67AF238BA5706F5F934BCD258925F3DF35F03AC6CA51B99C1B13BD4F790CFDA5` |
| `bundle\nsis\Bao Ve Cua So Tam Hon_1.0.0_x64-setup.exe` | 2,834,783 | `0095D9492ED511B0AD23CCEA73AFC91C463E030BCA0ECF56F448733EA862C5FA` |
| `tai_lieu\BaoVeCuaSoTamHon-1.0.0-CaiDat.zip` (installer + guide) | 2,820,081 | `2AB4A716791A4138AA58C8F9C3FA4C9FE8773949C03D119F4A46E6058ACD716F` |

Launching that binary still stops at `create_window` with `Access is denied`, the same no-desktop
failure. That proves the Rust clock did not break startup, and it proves nothing about whether the
clock fires: window creation happens before the setup closure runs, so the thread never starts on
this machine.

### 2026-11-16: it runs, and what actually broke the installer

The owner reported an installer failure: `Error opening file for writing:
C:\Users\vhiep\AppData\Local\Bao Ve Cua So Tam Hon\bao-ve-cua-so-tam-hon.exe`, from a setup file he
ran out of this workspace. The cause was not the app and not the installer.

**`D:\nguyen_ai_dan` carries a Low Mandatory Level integrity label**, applied by the DSH sandbox. Any
program launched from inside it inherits low integrity, and a low-integrity process cannot write to
`%LOCALAPPDATA%` (medium) nor create a normal desktop window.

```text
icacls D:\nguyen_ai_dan
  Mandatory Label\Low Mandatory Level:(OI)(CI)(NW)
icacls C:\Users\vhiep\AppData\Local
  (no mandatory label)
```

That one fact explains both failures seen this week: the installer could not write its file, and the
binary launched from the build folder died at `create_window` with `Access is denied`. Neither was a
defect in this project.

Run from a normal folder, the installer works:

```text
copy setup.exe to C:\Users\vhiep\Downloads   (no mandatory label)
setup.exe /S
exit code: 0 after ~3s
install folder: bao-ve-cua-so-tam-hon.exe 12,590,592 B | uninstall.exe 77,186 B
registry: Bao Ve Cua So Tam Hon | ver 1.0.0 | C:\Users\vhiep\AppData\Local\Bao Ve Cua So Tam Hon
```

And the installed app runs:

```text
exe hash matches our build : True
alive                      : True
main window title          : 'Bảo Vệ Cửa Sổ Tâm Hồn'
main window handle         : 1050466
working set                : 34.2 MB
threads                    : 26
webview children           : 6 (pid 1660 and its five children)
profile                    : %LOCALAPPDATA%\vn.baovecuasotamhon.app\EBWebView  exists
store                      : %APPDATA%\vn.baovecuasotamhon.app\store.json  exists
```

The first working launch also wrote `store.json` with `timeData` for `2026-11-16`, which is
`useTimeCount` running inside the webview - proof the React front end loaded, not just that a window
was made.

Two behaviours found along the way, both real and both unexplained beyond the observation:

- A second launch while the first is alive fails with `HRESULT(0x800700AA)` "The requested resource is
  in use" - the WebView2 user-data folder is held by the running instance. There is no single-instance
  guard, so a double-click can look like a silent failure.
- After a forced kill, a quick relaunch can fail the same way, and moving the `EBWebView` profile
  aside changes the failure to `Access is denied`. The `EBWebView` folder therefore should be treated
  as a stateful directory: a poisoned profile is a plausible cause of "it will not start" reports.

Both installer packages were rebuilt after the guide learned this rule. The guide now tells the reader
to copy the setup out to the Desktop before running it.

## Still unverified

- **The window opens; nobody has watched it.** On 2026-11-16 the installed app ran with the title
  `Bảo Vệ Cửa Sổ Tâm Hồn`, six WebView2 children and a written `store.json`, which proves the front
  end loaded. No screenshot exists, no reminder was seen, and no Vietnamese string has been read off
  a screen. The tray icon, the settings form and the fullscreen overlay are all still unseen.
- **The Rust clock has never ticked.** Its arithmetic is unit-tested and the release build contains
  it, but the app has only ever been observed for seconds at a time. Whether `reminder-due` reaches
  the window after 20 minutes, and whether the overlay appears over other applications, is unknown.
- The app has no single-instance guard: a second launch while the first is alive fails with
  `HRESULT(0x800700AA)` and no message, which a user reads as "it will not start".
- The screen-on-time counter in `useTimeCount.ts` still runs as a JavaScript timer in a window that is
  hidden most of the day, so it will undercount. It drives a statistic that the app labels "đang được
  làm", not a behaviour.
- Signing is undecided. No certificate exists, no submission to Microsoft has been made, and the Store
  route would need MSIX packaging that this project does not produce. Until one of those happens the
  installer shows "Windows protected your PC" for anyone who downloads it from the internet.
- The updater is gone, so the build no longer ends with a signing error. What that means for the app
  is untested: nothing has confirmed that removing the plugin left no code path calling it.
- `npm install` without `bun.lockb` wrote `package-lock.json` (lockfileVersion 3), which is now this
  project's pin. The ranges stayed inside their majors: vite 5.4.21, react 18.3.1, tailwindcss 3.4.19,
  esbuild 0.21.5, with `@tauri-apps/cli` 2.0.4 and `@tauri-apps/api` 2.0.3 still exact. TypeScript
  resolved from `^5.2.2` to 5.9.3 and the frontend compiled clean, so that risk is closed.
- The Rust toolchain sits inside this project at `.toolchain\`, which ties 0.8 GB to one consumer. If
  another project needs Rust, promoting it to `lac_hong\rung_ngap_man\rust` beside `node` and
  `python` is the right move; it is a separate, approved change and was not done here.
- Only an NSIS installer is produced. `targets` was narrowed to `["nsis"]` because `light.exe` failed
  while writing the MSI for the Vietnamese metadata; the MSI was never produced for 1.0.0, and no
  attempt was made to find which field broke it.
- `bundle.licenseFile` names `LICENSE.txt` while the root file is also `LICENSE.txt`, and
  `src-tauri\LICENSE.txt` is the MIT text at this commit, so the bundled notice is MIT - verified by
  reading both files, but not by inspecting the installed bundle.
- No antivirus, SmartScreen or code-signing behaviour was tested. An unsigned installer shows
  "Windows protected your PC" on first download; that is a release problem, not a code problem, and
  it is unsolved here.
- `copyright` and `publisher` in `tauri.conf.json` carry the owner's name as a placeholder decision.
  He has not confirmed them, and they appear in the installed app's properties.
- The Vietnamese wording is a first draft written by an AI. The owner decides it, and no screen has
  been reviewed by a Vietnamese reader on an actual running app.
- Anything run from inside `D:\nguyen_ai_dan` inherits a low-integrity label. That is a property of
  this workspace, not of the product, but it means a tester must copy the package out before running
  it, and any future release must never ship from inside the workspace folder.

Improvement: an AI may correct this file inside dan_chu; a change to its shape goes through khung_viet.md and the owner.

## 2.0.0 - the owner's own product, and what changed to get there

The owner renamed the app, redesigned it, and asked for five features on 2026-11-17. This section
records what that turned into and what was measured.

### The name, and why it is generated rather than typed

The product is **Chào em cửa sổ tâm hồn**; the ASCII binary is `chao-em-cua-so-tam-hon.exe` and the
identifier is `vn.xinchaotamhon.chaoem`. Display name and binary name are separate because Tauri 2
has `mainBinaryName` (`config.schema.json:26`): a Vietnamese name in the Start Menu, an ASCII name on
disk, so no path, script or tool ever has to carry diacritics.

The name was not typed by hand. It was built from code points in PowerShell
(`67,104,224,111,32,101,109,32` plus the existing `cửa sổ tâm hồn` code points already in
`tauri.conf.json`) and substituted into three files at once. Measured result:

```
name       : Chào em cửa sổ tâm hồn
codepoints : 67 104 224 111 32 101 109 32 99 7917 97 32 115 7893 32 116 226 109 32 104 7891 110
tauri.conf.json  replaced 2
app.ts           replaced 1
lib.rs           replaced 1
```

The identifier changed from `vn.baovecuasotamhon.app`, so the settings store starts empty and the
1.0.0 install is a separate product that must be uninstalled by hand. That was a deliberate trade:
the identifier is permanent once published, and it would otherwise carry the old product's name in
every user's `%LOCALAPPDATA%` forever.

### The mark

`src-tauri\app-icon.svg` is the Đông Sơn drum star: eight points, concave sides, đồng `#C9A227` on
chàm `#2E4A6B`, with a thin ring. `tauri icon app-icon.svg -o icons` produced all 17 sizes including
the `Square*Logo.png` set that MSIX needs. Eight points rather than fourteen because the tray shows
it at 16 px.

The same geometry is drawn at runtime by `src\lib\star.ts`, so the icon, the rail mark and the break
screen are one shape rather than three drawings that drift apart.

### The nine-pass redesign, and the two defects it exposed

The old screen was slop by the `unslop` test: a 240 px countdown, a red pill button, four different
animated backgrounds, gradient chrome, `animate-pulse`. It was replaced rather than patched.

| What changed | Before | After |
| --- | --- | --- |
| Type | `-apple-system, 'Segoe UI'` | Be Vietnam Pro, three subsets, 92 KB |
| Colour | Tailwind defaults plus a hardcoded `#FE4C55` | one chàm accent, one đồng moment, a warm neutral ramp |
| Navigation | shadcn sidebar, 23 KB, three entries pointing at one page | a 240 px rail, three real pages |
| Dashboard | the settings form was the dashboard | one figure (time to the next break), one sentence, three quiet facts |
| Break screen | 240 px number, red skip pill, particle background | a ring that empties, one sentence, a quiet text link |
| Dead weight | `ui\` (a 23 KB sidebar plus 10 unused primitives), 4 background components, `App.css`, `react.svg`, `icon.png`, `context.ts`, `hooks\setup.ts`, `app-api\` | deleted |

Two defects were found by looking, not by reasoning, and both are worth keeping:

1. **Deleting `App.css` deleted Tailwind itself.** The `@tailwind base/components/utilities`
   directives lived in that file, not in a separate `index.css`, and nothing else in the tree
   contained them. The first build after the rewrite compiled, launched, and rendered a completely
   unstyled page - blue underlined links, no layout. The generated CSS was 4.55 KB; after moving the
   directives into `src\theme.css` it was 16.58 KB. Nothing in the build output says "your stylesheet
   is empty"; only the screen does.
2. **`"2.0.6"` in `Cargo.toml` is not a pin.** It is `^2.0.6`. Adding two plugins forced a
   re-resolve and Tauri moved 2.0.6 -> **2.11.6**, with `tauri-plugin-dialog` landing on 2.7.0 and
   `tauri-plugin-single-instance` on 2.3.0 rather than the 2.2.1 and 2.0.2 chosen for compatibility.
   It built and ran, so the newer set was kept, but the earlier reasoning that "2.5.5 needs tauri
   ^2.12, so pin 2.0.2" was moot the moment cargo was allowed to resolve freely. A real pin needs
   `=2.0.2`.

### What was added, feature by feature

| Owner's request | What exists now | Where |
| --- | --- | --- |
| Up to three sessions, each with its own work and break length | `Vec<Session>` in Rust, `{ workMinutes, breakSeconds }` per row, clamped to 1-600 and 5-3600 | `lib.rs` `set_schedule`, `Settings.tsx` |
| A break picture the user chooses, with a slow zoom | image or GIF copied into `%LOCALAPPDATA%\vn.xinchaotamhon.chaoem\media`, shown full bleed with a 12-14 s scale | `import_media`, `Reminder.tsx`, `.nen-nghi` in `theme.css` |
| A sound at the start and at the end of a break | two slots, each defaulting to a generated chime | `src\assets\chuong-*.wav`, `Reminder.tsx` |
| A setting that removes the skip button | `chế độ nghiêm khắc`: no skip link, no title bar, and `onCloseRequested` refused while the countdown runs | `Reminder.tsx`, `Settings.tsx` |
| An update button | opens the project's releases page in the browser; the app downloads and runs nothing | `About.tsx` |
| A second launch must not die silently | `tauri-plugin-single-instance`, registered first, focuses the existing window | `lib.rs` |

Video was considered and refused by the owner in one sentence: "cho video vào người dùng lại xem
video thì còn nói gì là bảo vệ mắt nữa". The extensions `import_media` accepts are therefore
`png jpg jpeg gif webp` and nothing else, with a 100 MB cap.

Strict mode is honest about its limit: `Alt+F4` and Task Manager still win, and the setting's own
description says "bạn sẽ không thoát ra được trong khoảng thời gian nghỉ đã chọn" rather than
claiming impossibility.

The two chimes are arithmetic, not art: a 44.1 kHz mono 16-bit WAV written by a 90-line script from
sine partials with a 12 ms attack and an exponential decay. `chuong-mo.wav` is 167,624 B (D5 then A5,
1.9 s), `chuong-tan.wav` is 141,164 B (A4 then E5, 1.6 s). The generator was a task file in
`D:\dsh-tmp` and is not kept.

### Verified, with the commands and the numbers

```
npm run tauri build            -> EXIT=0
  Built application at: src-tauri\target\release\chao-em-cua-so-tam-hon.exe
  Finished 1 bundle at: ...\nsis\Chào em cửa sổ tâm hồn_2.0.0_x64-setup.exe

cargo test --lib               -> 5 passed; 0 failed
  twenty_minutes_is_twelve_hundred_ticks / the_interval_is_never_zero
  a_longer_interval_waits_longer / a_session_keeps_its_own_two_lengths
  absurd_values_are_pulled_back_into_range

exe     13,893,120 B  sha256 DF7B937557FB9BC341A7FF5F9027C661332A7236AC0B2F700C3B87D24AC32E66
setup    3,352,606 B  sha256 387DBABC586B366E6A681DDC703C4C1CB1FB45E3282AE2DB546F7209AE23B6E0
tauri 2.11.6 | tauri-plugin-dialog 2.7.0 | tauri-plugin-single-instance 2.3.0 | tauri-plugin-store 2.1.0
dist 18 files, 712,934 B  (index.js 226.77 kB, index.css 16.58 kB, fonts 92 KB, chimes 309 KB)
```

The single-instance fix was measured directly rather than assumed:

```
after first launch : 1
after second launch: 1
second process exited: True  exitcode: 0
```

**Every screen was photographed and looked at.** The app was copied to `D:\dsh-tmp\chaoem` (a folder
with no integrity label) and launched, and the screen was captured with `System.Drawing`. Four
screens were read at full 1920x1080 resolution: Today (ring, 19:53 left, "Lần nghỉ tới lúc 18:54",
three quiet facts), Settings (the session row, the sentence field, the picture picker, both sound
slots), About (version 2.0.0 read from `getVersion()`, the releases button, the source link, the three
credits), and the break screen (gold star, ring at 16 of 20 seconds, the sentence, "Bỏ qua lần này").

Two design faults were found that way and fixed in the same session: the dark-mode primary button
rendered as a default light blue (`hsl(212 34% 64%)`), replaced by an off-white with dark text; and
the dashboard printed the countdown twice, once in the ring and once in the sentence, so the sentence
now says the wall-clock time the break arrives instead.

**The reminder fired by itself, and that was the point of the exercise.** The store was given a
one-minute schedule (`"chaoem.schedule": [{"workMinutes": 1, "breakSeconds": 20}]`) before launch, and
60 seconds later the break window appeared on its own, full screen, at 16 seconds remaining - so the
Rust clock, the store read at startup, the `reminder-due` event, the window creation and the break
screen all work as one chain. The store was then set back to 20 minutes.

Two measurement traps cost most of the time here and both are worth keeping:

- **This process is DPI-unaware.** `Screen.PrimaryScreen.Bounds` reported `1536x864` for a 1920x1080
  screen at 125% scaling, so every capture was a 1536-wide crop of the physical screen and every
  coordinate was a quarter out. Calling `SetProcessDpiAwarenessContext(-4)` first fixed it:
  `screen: 1920x1080`, `window: 326,121 1268x847`.
- **A click goes to whatever window is on top.** Earlier clicks did nothing and the first conclusion -
  "synthetic input does not reach WebView2" - was wrong. The app window was simply behind File
  Explorer. `SetWindowPos(hwnd, HWND_TOPMOST, ...)` before clicking made the rail navigate on the
  first try, and `HWND_NOTOPMOST` afterwards put it back. `SendInput`, `mouse_event` and
  `SetForegroundWindow` were all fine; z-order was the whole problem.

### Still unverified after 2.0.0

- The file picker has never been opened: `tauri-plugin-dialog` was added, the command exists and the
  button renders, but nobody has picked a file and seen it copied into the media folder.
- A custom picture and a custom sound have never been played back through the asset protocol. The
  scope `$APPLOCALDATA/media/**` is declared and the build accepted it; whether the webview is allowed
  to read the file is unproven.
- Strict mode's `onCloseRequested` refusal has not been tested against a real `Alt+F4`.
- The tray menu's "Nghỉ ngay" entry has not been clicked; the event path exists in both Rust and
  `App.tsx`, but no click has run it.
- A three-session schedule has not run a full cycle; only the single-session case fired.
- The installer has not been installed on a clean machine since the rename. Installing 2.0.0 does not
  remove 1.0.0 - they are different identifiers - so the old one must be uninstalled by hand.
- `website\` (63 files, 12,122,157 B) is still uncut.

## 2.1.0 to 2.1.2 - the break got a drawing, a readable sentence, and minutes

Three builds went out on the evening of 2026-11-17, each because the owner looked at the one before it
and said what was wrong. What changed, and what proved it, is below; the versions are separate because
each was installed and looked at, so a later reading can tell them apart.

### 2.1.0 - the break says what to do, and shows it

The owner's words were that a sentence alone is not visual, and he asked whether there could be a
moving picture. So `src\lib\actions.ts` holds five actions - nhìn ra xa, chớp mắt chậm, nhìn gần rồi
nhìn xa, thả lỏng vai và cổ, đứng lên - each with a title and one sentence, and
`src\components\BreakIllustration.tsx` draws each one as a few lines of SVG animated with SMIL.

No animation library was added. A Lottie file would bring a licence, a second visual language and a
dependency for five drawings that are a handful of paths each, and the stroke and the đồng colour
have to match the app's own mark. SMIL rather than CSS because the animation lives next to the shape
it moves.

The n-th break of the day takes the n-th action, so the five cycle through the day; the counter is in
the store, so the cycle survives a restart. `chaoem.actions` turns the drawings off, and the screen
then shows the owner's own sentence as before. The first version of this screen also had a real
defect the owner photographed: on a bright background picture the sentence was unreadable, so a
radial wash darkens the centre hard (0.88) and keeps the edges (0.30).

That 2.1.0 was installed is in the registry, not in a claim: `DisplayVersion : 2.1.0`, exe
13 894 144 B written 22:21. The store then held `"chaoem.actions": true` and
`"chaoem.media": { "image": "image.png" }` with the 6 887 399 B file in the app's media folder - the
owner picked that picture himself, which is the first proof that the file picker and the asset
protocol actually work end to end.

### 2.1.1 - two drawings redrawn, and the break typed in minutes

- **Figure 4, thả lỏng vai.** Two full arrows beside a shoulder curve read as a bracket, not as two
  shoulders dropping: an arrow drawn beside a curve at 104 px becomes part of the curve. They are now
  two small chevrons outside the body, and what drops is the whole upper body - head, neck, shoulders
  and arms - so the movement belongs to a person instead of to a floating line.
- **Figure 5, đứng lên.** The chair was an `L`, and an `L` at this size reads as a hook. It is now
  back, seat and two legs. The figure also used to be translated up and down, which put its feet
  through the floor line for two seconds of every 4.4-second cycle; the body now moves as a whole and
  the legs are interpolated between a short seated pair and a long standing pair, so the feet stay on
  the floor and the person really sits before standing.
- **The break is entered in minutes and seconds** over the one stored `breakSeconds`: the
  twenty-second rule stays typeable and a five-minute break is typed as `5`, not `300`. The floor of
  five seconds is still enforced by `sanitizeSessions`, and after a save the screen now shows what the
  store kept instead of what was typed.
- **`dan_chu\preview-hinh.mjs`** renders the real component - not a copy of its SVG - with
  `react-dom/server`, freezes each drawing at chosen moments and screenshots it with the browser
  already on this machine. It exists because the first session that previewed these drawings by hand
  had to patch a duplicated copy of the SVG after every edit, and because a still of an animation
  hides the state that is wrong: the feet through the floor line only showed at t=0 of the cycle.

### 2.1.2 - the words on a picture are light

The owner found this one by using the app: *"Khi tôi đặt nền sáng thì chữ khi nghỉ bị tối."* The
break screen took its text colour from the theme, and in light mode that is dark ink; the wash
darkened the photograph but the sentence stayed dark on dark. The words on a picture are now a fixed
light tone (`#f5f0e6`, and the same at 75 % for the unit line and "Bỏ qua lần này") whichever theme
the app is in. The rule this leaves: any colour a screen takes from the theme has to be re-decided the
moment a picture the user supplied goes behind it.

### Evidence, with the command and its real output

    $ node node_modules\typescript\bin\tsc --noEmit
    TSC_EXIT=0

    $ node dan_chu\preview-hinh.mjs -Out D:\dsh-tmp\hinh-dong5.png -Times 0,1.2,2.2 -Window 1340,520
    PNG D:\dsh-tmp\hinh-dong5.png 48381 B
    HTML ...\.toolchain\tmp\preview-hinh\hinh.html 13333 B

    $ npm run tauri build                     (2.1.1)
        Finished `release` profile [optimized] target(s) in 2m 22s
        Built application at: ...\src-tauri\target\release\chao-em-cua-so-tam-hon.exe
        Finished 1 bundle at:
    EXIT=0
    installer Chào em cửa sổ tâm hồn_2.1.1_x64-setup.exe  3356386 B  22:51:56
    installer exit: 0   DisplayVersion : 2.1.1

    $ npm run tauri build                     (2.1.2, after the text-colour fix)
        Finished `release` profile [optimized] target(s) in 1m 08s
    EXIT=0
    installer Chào em cửa sổ tâm hồn_2.1.2_x64-setup.exe  3352354 B  22:55:59
    installer exit: 0   DisplayVersion : 2.1.2

Three screenshots were taken of the installed app on this machine and looked at: the break screen on
2.1.1 with dark text over the owner's photograph (the defect), the same screen on 2.1.2 with white
text and 11 seconds left (the fix), and the Settings screen on 2.1.2 reading
`Phiên 1  Làm việc [20] phút  Nghỉ [0] phút [20] giây`. They live in `D:\dsh-tmp` as
`b1-cai-dat-211.png`, `c2-cai-dat-212.png` and `c3-cai-dat.png`; that folder is temporary, so what
survives is the observation above, not the file.

The deliverable was rebuilt in the same pass, because `tai_lieu\` still carried the 2.0.0 zip while
the product had moved twice: `HUONG_DAN_CAI_DAT.html` now says 2.1.2, names the `2.1.2` setup file,
describes the drawing on the break screen, and its settings table has a row for the minutes-and-seconds
break and a row for "Đổi động tác mỗi lần nghỉ". `ChaoEmCuaSoTamHon-2.1.2-CaiDat.zip` is
3 337 956 B and holds exactly two entries, the 3 352 354 B setup and the 8 939 B guide - checked by
listing the archive after writing it. The 1.0.0 and 2.0.0 zips beside it are older releases and were
left untouched for the owner to delete or keep.

Two break windows also appeared within seconds of two launches during this work. A clean launch was
then watched for twelve seconds and showed only the main window, so neither is a startup defect: one
was the owner using the app, the other a click of this session that landed on the reminder. The
mechanism of the first is the owner's report, not a measurement.

## 2.1.3 - a manual break ends the stretch, and the repository went up

### The defect the owner found by using it

*"Khi tôi bấm nghỉ ngay thì đồng hồ vẫn chạy và phiên không sang phiên mới."* He is right, and it was
two answers to one question: the break screen said the stretch was over while the clock behind it kept
counting and the session stayed where it was. "Nghỉ ngay", from the main screen and from the tray, only
opened the break window; nothing told Rust that the stretch had ended.

The fix is one command, `take_break_now`, and one rule for the caller: the break window is opened with
the length that belonged to the stretch just ended. Rust moves the schedule on (`next_index`, which
wraps like the clock's own firing), zeroes the elapsed counter and bumps the generation so the clock
thread restarts; it returns the break length of the session that ended, because the snapshot cannot
answer for it - by the time the break window boots, the schedule has already moved on. The caller
(`startBreakNow` in `src\lib\reminderWindow.ts`) does both, and the window reads `?giay=<n>`.

A manual break does **not** increase "Số lần nhắc hôm nay": that figure counts the reminders the app
raised, and a break the user asked for is not one. That is a decision, not an oversight.

Verified in the installed app: before the click the screen read `09:42`, "Làm 10 phút", `Phiên 1/3`;
after the twenty-second break it read `19:35`, "Làm 20 phút", `Phiên 2/3` - the countdown restarted on
session 2 and used session 2's own twenty minutes. `cargo test --lib --release` passes six tests,
including the new `a_manual_break_moves_on_and_wraps`.

### The install that lied, and the rule it leaves

The first 2.1.3 install reported `exit 0` and the registry answered `DisplayVersion : 2.1.3`, but the
exe in `%LOCALAPPDATA%` was still the 2.1.2 build: 13 894 656 B written 2026-11-17 22:55, and a scan of
its bytes found `reminder_snapshot` twice and `take_break_now` zero times. The app had still been
running when the installer ran, so NSIS updated the registry and skipped the locked file.

The rule: after installing, compare the installed exe's write time and size with
`src-tauri\target\release\chao-em-cua-so-tam-hon.exe`, or search its bytes for a string only the new
build contains. The registry version is not evidence that the binary changed. Installing again with no
process running gave 13 875 712 B, sha256 `835810617610829B...`, and `take_break_now` present once.

### The repository

`github.com/xinchaotamhon/Chao_em_cua_so_tam_hon` was an "Initial commit" holding one `LICENSE`. The
product's tree now sits on top of it: commit `695db37`, 116 files, 1.5 MB, pushed to `main`, and
`git ls-tree -r origin/main` lists `src/lib/actions.ts`, `src/components/BreakIllustration.tsx` and
`dan_chu/preview-hinh.mjs`. The local repository is this folder with `origin` set; the credential
already in Windows Credential Manager was enough, so the push ran without a login window.

Left out of the repository on purpose, each with its reason in `.gitignore`: `node_modules` and `dist`
(rebuilt from the lock files), `.toolchain` and `src-tauri/target` (43,390,700 B and 8.5 GB measured
2026-11-21 - `.toolchain` holds `tmp` alone since the two old folders moved out and the installer was
deleted, and `target` was cleaned to zero the same day, so both are rebuilt on demand), `tai_lieu/*.zip` and the extracted 1.0.0 installer (binaries belong in Releases), and
`website/` - 11.6 MB of upstream's marketing site, including a 10.8 MB GIF, which nothing in the app
imports. That last one is the only difference between the tree and the repository, and it disappears
the day the owner decides to cut the folder.

### MSIX, and what it does not do

The owner wants MSIX to avoid the SmartScreen warning. MSIX is the right *format* for the Microsoft
Store, but on its own it does not remove that warning: a downloaded MSIX whose signing certificate is
not trusted on the machine fails with `0x800B0109`, and there is no "run anyway" path - a harder stop
than the NSIS installer has today. The warning disappears only when the package is signed by something
Windows already trusts: the Store, which signs every submitted package, or a paid code-signing
certificate. Neither exists yet, so no MSIX was built. What it needs is recorded in `Y-056`.

### 2.1.3 - the Store package

The MSIX the previous section said did not exist now exists, and it needed no download: `makeappx.exe`
and `signtool.exe` were already on this machine, in
`C:\Program Files (x86)\Windows Kits\10\App Certification Kit\`, and an earlier session had looked for
them only under `Windows Kits\10\bin`. They are now a shared block, `lac_hong\rung_ngap_man\msix`, with
`dan_chu\msix.cmd` and `dan_chu\ky.cmd`, and the packaging itself is `dan_chu\dong-goi-store.ps1` here.

    $ pwsh -NoProfile -File dan_chu\dong-goi-store.ps1
    Packing 7 file(s) ... to "tai_lieu\ChaoEmCuaSoTamHon-2.1.3-x64.msix"
    MSIX      ...\tai_lieu\ChaoEmCuaSoTamHon-2.1.3-x64.msix
    Size      4,654,094 B (4.4 MB)
    Version   2.1.3.0
    Identity  XinChaoTamHon.ChaoEmCuaSoTamHon
    Publisher CN=00000000-0000-0000-0000-000000000000
    sha256    65B75D94CAF631F945ED170B4206BD93622355BCF843096255328D0B8FFDD894

    $ makeappx unpack /p <that file> /d <fresh dir>       -> exit 0, 8 entries:
    AppxBlockMap.xml 16656, AppxManifest.xml 1749, 5 PNG assets, chao-em-cua-so-tam-hon.exe 13875712

The first attempt failed and taught the manifest rule that is now written in the block's `hau_can.md`:
`DefaultTile` may not name `Square310x310Logo` without `Wide310x150Logo`
(`0x80080204 ... Line 33, Column 26`). The wide image is composed from the 150 square inside the script,
so no second source asset was added to the project.

`Identity` and `Publisher` are placeholders on purpose. They must be replaced with the pair Partner
Center issues when the owner reserves the app name, and the package rebuilt; a package carrying the
placeholder pair is refused at upload with a message that does not say which field is wrong.
`tai_lieu\HUONG_DAN_NOP_STORE.md` walks through reserving the name, re-running the script, uploading,
the listing fields, and the four things that decide a first submission.

What is still unverified about this package: it has never been installed (that needs a certificate the
machine trusts, and the Store is the only signer here), Partner Center has never seen it, and `appcert.exe`
- the local version of the Store's checks - needs elevation and has not been run.

## 2.1.4 - the break window can no longer be left on the screen

The owner reported, with a screenshot, a break at `00:00` that never closed: *"khi tôi bấm nghỉ ngay ở
phiên 3 thì khi chạy xong bị treo màn hình không tự tắt đi"*. Session 3 in his store is 20 minutes of work
and an 80-second break, so the break was longer than a minute, which is the only unusual thing about it.

**What was measured, not guessed.** The break window was followed by listing the process's top-level
windows and their titles instead of by screenshots. On 2.1.3 the reported path was walked twice - three
"Ngỉ ngay" clicks in a row, the third carrying session 3's 80 seconds - and the window closed correctly
each time (`Nghỉ mắt` visible at second 3, gone at second 85). So the hang did not reproduce here, and the
root cause is not established.

**What changed anyway.** The end of the break had one way to close the window and no fallback:
`appWindow.close()` in a 1400 ms timer. A close request can be refused - by a listener, by the window
manager - and the result is a full-screen window on top of everything with `00:00` on it. `Reminder.tsx`
now closes through `closeForGood()`: one guard so the sound and the attempt happen once, `close()` first,
and `destroy()` after it, which removes the window whatever any listener says. The "Bỏ qua lần này"
button uses the same helper, so the manual way out cannot fail where the automatic one did.

Verified on the installed 2.1.4 (installed exe `13 868 032 B`, sha256 prefix `29DA3533EBA00666`, equal to
the built exe - the check that 2.1.3 taught):

    break 1 (session 1, 20 s):  "Nghỉ mắt" visible at 3 s, gone at 25 s
    break 2 (session 2, 20 s):  gone at 25 s
    break 3 (session 3, 80 s):  visible at 3 s, gone at 85 s

**Still open.** If the webview itself freezes, nothing on the JavaScript side runs and the window stays;
that case needs a watchdog in Rust with a heartbeat from the window, and it is not built because there is
no evidence of a frozen webview yet. The one observation that decides between the two is whether
"Bỏ qua lần này" worked when it hung: if it did, the close was refused and this fix covers it; if the whole
screen was dead to clicks, the watchdog is what is missing.

### Still unverified after 2.1.4

- Only one of the five drawings has been seen inside the running app (chớp mắt, mid-blink, at
  1920x1080). The other four have been seen only as the browser render of the same component.
- A custom **sound** has still never been played back; only the two built-in chimes have been heard.
- Figure 5's seated pose is schematic: the legs shorten instead of bending at the knee, so it reads as
  sitting in motion rather than as a drawing of a seated person. If the owner wants a true seated
  pose, the two leg states have to be cross-faded rather than interpolated.
- The repository's upstream workflows under `.github/workflows/` were carried over from the fork and
  have never run here; whether they build an installer without upstream's secrets is unproven.

Improvement: an AI may correct this file inside dan_chu; a change to its shape goes through khung_viet.md and the owner.
