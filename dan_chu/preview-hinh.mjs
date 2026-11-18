/**
 * Look at every break drawing without launching the app.
 *
 * The drawings live in `src\components\BreakIllustration.tsx` as React components, and copying
 * their SVG into a test page by hand is how a preview stops matching the product - the first
 * session that did it had to patch the copy after every edit. So this script bundles the real
 * component, renders it with `react-dom/server`, and screenshots the result with the browser
 * already on this machine. No dependency is added, nothing is installed, and what it writes is a
 * picture to look at, never part of the build.
 *
 * Each drawing is captured at more than one moment, because an animation has states: a still of
 * a moving figure hides the state that is wrong.
 *
 *     node dan_chu\preview-hinh.mjs [-Out D:\dsh-tmp\hinh-dong.png] [-Times "0,2.2"]
 *
 * It prints the PNG path and its size; open it and look, then fix the component and run it again.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const node = "D:\\nguyen_ai_dan\\lac_hong\\rung_ngap_man\\node\\node.exe";
const esbuild = join(root, "node_modules", "esbuild", "bin", "esbuild");
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const png = resolve(arg("-Out", "D:\\dsh-tmp\\hinh-dong.png"));
const times = arg("-Times", "0,2.2")
  .split(",")
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isFinite(n));

const work = join(root, ".toolchain", "tmp", "preview-hinh");
const html = join(work, "hinh.html");

const TITLES = [
  ["nhin-xa", "Nhìn ra xa"],
  ["chop-mat", "Chớp mắt chậm"],
  ["gan-xa", "Nhìn gần, rồi nhìn xa"],
  ["thu-gian", "Thả lỏng vai và cổ"],
  ["dung-day", "Đứng lên"],
];

mkdirSync(work, { recursive: true });

writeFileSync(
  join(work, "entry.tsx"),
  `import { renderToStaticMarkup } from "react-dom/server";
import BreakIllustration from "../../../src/components/BreakIllustration";

const titles: [string, string][] = ${JSON.stringify(TITLES)};
const times: number[] = ${JSON.stringify(times)};

const figures = titles
  .map(([id, label]) => {
    const svg = renderToStaticMarkup(<BreakIllustration id={id} size={104} className="ve" />);
    return \`<figure>\${svg}<figcaption>\${label}</figcaption></figure>\`;
  })
  .join("");

const rows = times
  .map((t) => \`<section class="row" data-t="\${t}"><h2>t = \${t}s</h2><div class="hang">\${figures}</div></section>\`)
  .join("");

const page = \`<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>
  body { margin:0; background:#14120e; color:#f2ede2; font-family:system-ui,sans-serif; padding:16px 24px; }
  .row { display:flex; align-items:flex-start; gap:14px; margin-bottom:10px; }
  h2 { margin:6px 0 0; font-size:11px; font-weight:400; color:#6f6656; width:52px; }
  .hang { display:flex; gap:14px; }
  figure { margin:0; text-align:center; background:#1d1a15; border-radius:14px; padding:12px 12px 10px; }
  .ve { color:#c79a28; display:block; }
  figcaption { margin-top:6px; font-size:11px; color:#c79a28; }
</style></head><body>\${rows}
<script>
  for (const row of document.querySelectorAll(".row")) {
    const t = Number(row.dataset.t);
    for (const svg of row.querySelectorAll("svg")) { svg.pauseAnimations(); svg.setCurrentTime(t); }
  }
</script></body></html>\`;

process.stdout.write(page);
`
);

execFileSync(
  node,
  [
    esbuild,
    join(work, "entry.tsx"),
    "--bundle",
    "--platform=node",
    "--format=cjs",
    "--jsx=automatic",
    "--log-level=warning",
    `--outfile=${join(work, "preview.cjs")}`,
  ],
  { stdio: "inherit" }
);
const page = execFileSync(node, [join(work, "preview.cjs")], { encoding: "utf8" });
writeFileSync(html, page, "utf8");

rmSync(png, { force: true });
execFileSync(
  edge,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--user-data-dir=${join(work, "edge-profile")}`,
    `--window-size=${arg("-Window", "1340,360")}`,
    `--screenshot=${png}`,
    `file:///${html.replace(/\\/g, "/")}`,
  ],
  { stdio: "inherit" }
);

console.log(`PNG ${png} ${statSync(png).size} B`);
console.log(`HTML ${html} ${readFileSync(html).length} B`);
