# Galanty Launch · 正式发布片 Toolkit

A standalone, standard Remotion project: sourced brief → musical sections →
full-screen product story → beat-aligned 30-second, 1080p MP4.
No Galanty installation, Python,
cloud account, LLM call, screenshots or downloaded music required.

For agent-led launch-film production, start with [SKILL.md](SKILL.md): it defines
the creative checklist, source boundaries and preview-first workflow. The default
film depicts **Zelqio**, a fictional developer workflow product. Its claims refer
to the fictional [example document](examples/product.md); every frame carries
`DEMO / 示例`. Real products appear only in the internal `eval/` fixtures.

## Run / 一条命令出示例

Requirements: **Node 22+**, npm, **FFmpeg 6+ and ffprobe** on PATH. macOS first,
with portable Node/Remotion code; other OS visual output is not yet verified.
Run these commands **inside this directory**, or copy this entire directory to
start a separate project:

```sh
npm i                      # or npm ci using the committed lockfile
npm run demo               # build/promo.mp4 + nine PNG frames + 3×3 contact sheet; 30s / 1080p / 30fps
npm run check              # second complete render + all-frame decoded hashes + delivery checks
npm test
npm run typecheck
```

The first render automatically downloads Remotion's Chrome Headless Shell
(around 94 MB); rendering afterwards is local. Install dependencies and browser
before going offline. See `build/render.json`, `build/prepare.json` and
`build/check.json` for elapsed times and evidence. Generated media, build output
and dependencies stay ignored by Git. `demo` never edits your authored brief or
scene files; it replaces its generated output under `build/` and `public/generated/`.

## Preview after every edit / 每次改完就预览

```sh
npm run preview -- --at 12.5
npm run preview -- --at 12.5 --dry-run    # detect and print; never open an app or generate media
```

On macOS the script detects `/Applications/Galanty.app` or a registered
`galanty://` handler, then calls `open` with
`galanty://open?path=<URL-encoded absolute project directory>&t=12.5`.
This follows the Galanty preview deep-link contract; folder authorization may
be requested by the App. The first version of this toolkit verifies the command
and detection, not the App-side navigation (owned by the preview implementation).

If Galanty is unavailable, it runs `npx --no-install remotion studio
scenes/index.tsx --port=4391` and explains that installing Galanty adds one-step
preview and seeking. Studio fallback opens the timeline; seek manually to the
printed second. `npm run studio` also opens Studio directly, after `npm run plan`.
After every edit, preview and seek to the changed second before exporting. With
Galanty MCP, use the returned `open` action; without MCP use the deep link above.
The automated evaluation lane suppresses App opens and verifies renders separately.

未安装文影也能完整出片；安装文影可一键预览和跳秒。标准 Remotion 路径无需重写为
任何专有分镜格式，也不依赖已安装 App。

## Your brief / 你的简介

Edit `brief.json`. Product name, tagline, selling points, palette, music style,
seed and duration are data; a new product does not require changing React.
Every selling point requires a nonempty `source`: a repository file/section,
document or URL. The planner rejects missing sources **before** synthesis.
It preserves references in `build/storyboard.json`; it cannot establish that a
claim is true or that a URL's contents support it. Verify the source yourself.
See [examples/product.md](examples/product.md) for the fictional Zelqio source map
and limits: **4 stages** counts capture/replay/compare/report; **16 traces** is an
illustrative review workload, not a measured throughput or concurrency ceiling.
Its commands are fictional display copy and are never executed. The geometric
Z mark is original. The workflow step axis is not a release-history claim.
Optional `demoLabel`, `terminalLines`, `codeCaption`, `gridItemLabel`,
`revealCaption` and `timelineCaption` provide sourced screen copy; do not keep
another product's capabilities in the scene code when replacing a brief.
Numeric scenes require a nonempty `metric.source`, a label and a positive finite
`metric.value`; the planner does not derive a metric from an unsourced sentence.

```json
{
  "productName": "Your product",
  "tagline": "Make room for your next idea.",
  "sellingPoints": [{"text": "One clear benefit", "source": "docs/your-product.md#benefit"}],
  "palette": {"background": "#080c14", "foreground": "#f2f5fc", "accent": "#adf58b"},
  "musicStyle": "electronic",
  "seed": 105,
  "durationSeconds": 30
}
```

```sh
npm run demo -- --brief examples/my-brief.json
# Standard Remotion CLI also works after preparation:
npm run plan
npx remotion render        # remotion.config.ts selects scenes/index.tsx → build/direct.mp4
```

The default demo uses a launch sequence with full-screen terminal, short impact
words, a sourced stage counter, workflow steps, code, a trace grid and an
original logo ending. Choose primitives for the story; there
is no requirement to show the whole component library. Intro stays restrained;
build develops every four beats and Drop cuts every two beats, reserving the
strongest impact words, scale grid and logo for the Drop. Cuts are snapped to
beat frames. The planner retains each source, local frame range, musical section
and hold budget. Inspect or customize `scripts/storyboard.mjs` for a different
creative structure.

停留推荐：build 默认四拍、Drop 默认两拍；阅读时间为
`0.25s + 0.1s × 字/词/数字组`，另留揭示时间。长文案先人工压缩或调整镜头，
不要静默截断。长文案或刻意快速蒙太奇会给建议，不会阻止作者出片；
可缩短文案、增加停留或调整结构。建议片长 20–45 秒，
默认 30 秒；合成器技术支持 4–300 秒。

## UI primitives / 界面原语

`scenes/primitives.tsx` exports pure scene-local frame components. New full-screen
components are implemented in `scenes/launch.tsx` and receive `LaunchProps`:
`frame`, `durationInFrames`, `fps`, `bpm`, `brief`, `scene`. The legacy components
use `PrimitiveProps`, including `accent`, `text`, `productName` and `items`; inspect
component types for supported data. The default composition is
1920×1080. Full-screen scenes keep one main focus: roughly 96px or larger titles
and 160px or larger impact words at 1080p; scale proportionally for other outputs.
All animation uses numeric frames / Remotion interpolation and springs;
**no CSS transition, CSS animation, runtime clocks or random calls**.

| Full-screen component | Narrative use |
|---|---|
| `LaunchTerminal` | command-led opening / product reveal |
| `ImpactWord` | 2–4 Chinese characters or 1–3 English words over a softened UI/code background |
| `ToolCounter` | sourced count of named categories; no invented growth curve |
| `MilestoneTimeline` | dated, sourced historical events |
| `FullCode` | readable full-screen code / command evidence |
| `ScaleGrid` | multiple windows with large caption; label illustrative workloads |
| `PixelLogo` | original geometric/pixel logo reveal and closing action |

The original eight primitives remain reusable:

| Component | What it draws | Additional props |
|---|---|---|
| `Terminal` | command typing, cursor, progressive output | `text` command, `items` output |
| `CodeEditor` | syntax color, active line, smooth code scroll | `code`, `filename`, `highlightLine` (zero-based) |
| `BrowserWindow` | browser chrome, progressive product cards | `url`, `children` |
| `PhoneFrame` | phone shell, notification stack | `children` |
| `CardStack` | file/card layering without replacing earlier cards | `items` |
| `GrowthChart` | rising number, line and endpoint | `value`, `prefix`, `suffix`, `decimals`, `points`, `labels` |
| `FeatureTrio` | three retained feature cards | `descriptions` |
| `LogoReveal` | generic mark, product name, slogan | `children` to replace mark |

## Music / 原创合成配乐

Node synthesizes each sample (48 kHz, stereo). No Python or audio samples.
System FFmpeg measures EBU R128 and masters the WAV, then `check` measures the
**delivered MP4 audio**, including AAC encoding. Target **−14 LUFS** (delivery
tolerance ±0.3 LU), true peak **≤ −1 dBTP**; the WAV aims at −3 dBTP to leave
encoding headroom. Failed delivery metrics fail `check`; they do not forbid a
user from choosing a different artistic master or rendering via Remotion CLI.

The delivery script renders picture first, then muxes the original WAV with
FFmpeg AAC (320 kbps, 18 kHz cutoff). This preserves MP4 encoder-delay metadata
and avoids the pinned Remotion version's roughly 43 ms ADTS priming offset.
Use `npm run render` for this measured delivery path; bare Remotion CLI output
does not include the toolkit's final sound mux or `check` evidence.

| `musicStyle` | Tempo | Structure / sound |
|---|---|---|
| `electronic` | 128 BPM | intro → build → Drop → outro; kick, synth, bass |
| `lofi` | 80 BPM | intro → groove → outro; swung plucks, soft drums |
| `epic` | 100 BPM | intro → rise → climax → outro; layered pads, brass-like tones |

`scripts/music.mjs` exports `synthesize({style, seed, durationSeconds, outDir})`.
Outputs `music.wav` and `beat-grid.json`: exact composed beats, bars, sections,
sample rate, seed, measurements and provenance. Same seed and parameters produce
sample-identical audio on the same Node/FFmpeg toolchain. Cross-platform floating
point/rasterizer/encoder equality requires separate testing; versions matter.
The final bar may be partial to honor the exact requested frame duration.

## Checks and evidence / 检查

`npm run check` requires a fresh `npm run demo` / `npm run render` output. A source,
brief, font or generated-media change invalidates the render fingerprint.

| Check | Evidence / behavior |
|---|---|
| Hold budget | Per-scene measured/recommended durations; advisory only |
| Visual coverage | All-frame heuristic for low picture occupancy / sparse scenes; advisory only, not visual approval |
| Cut-to-beat residual | Actual integer-frame cut times vs music grid; median ≤10ms |
| Music timing | Decode MP4, low-pass 150Hz, detect 5ms energy transients; electronic Drop median ≤10ms and ≥90% matches; Lo-fi/epic have intentional sparse/swung kicks and report no Drop measurement |
| Loudness / true peak | FFmpeg loudnorm input measurements on delivered MP4 |
| Determinism | Two complete independent Chromium renders; all decoded RGBA frame SHA-256 hashes must match; nine representative PNG hashes are also retained |
| Fonts | Both local OFL faces block rendering until loaded; browser load evidence + brief glyph coverage from font manifest |
| Duration | ffprobe duration within one frame, exact frame count and dimensions, audio track present |

Check results are engineering evidence, not visual approval. Always watch the
whole film, inspect all nine frames and the 3×3 `build/contact-sheet.png`
(640×360 cells, 6px gutters; 1932×1092 overall), and listen to music before
publication. Decoded hashes compare every frame of these two local renders; this is not a cross-platform guarantee. All-frame visual coverage is a heuristic: low occupancy
is a prompt to inspect composition, not a delivery failure or a substitute for
watching. Rendering uses temporary local
services on port 4392 (override with `GALANTY_RENDER_PORT=4397` for an isolated lane); preview fallback uses 4391. They must be free. Scripts close
their browser and temporary render services on normal completion; render reports
record the Node PID. No installed Galanty/QA instance is touched by automated tests.

## Fixed evaluation / 固定评测

```sh
npm run eval                       # 15 isolated starters → render → check (serial, no App open)
npm run eval -- --filter cli,saas   # bounded subset
npm run eval:agent -- --help       # Codex / Claude Code / Gemini CLI; empty-directory trials
npm run compare -- --reference build/reference-study.png  # optional, locally supplied 3×3 reference
```

See [eval/README.md](eval/README.md) and [eval/agent-runner.md](eval/agent-runner.md).
Reports and process logs stay under `.lane-data/`; curated, path-redacted baseline
results live in `eval/results/`. The template run measures engineering success;
Agent first-film success is a separate experiment. Neither proves visual quality.
The local comparison places the supplied reference at left and the current demo
at right, without bundling reference media or implying a brand endorsement.

## Licenses / 许可

Toolkit code and generated original music: **MIT**. Fonts: **SIL OFL 1.1**, bundled
with copyright, license texts and a glyph/hash manifest; see [NOTICE.md](NOTICE.md).
No third-party brand artwork or music is included; the demo interfaces and
geometric Z monogram are original illustrations, with fictional product claims attributed
in [examples/product.md](examples/product.md).

All `remotion` / `@remotion/*` packages are pinned to **4.0.523**, and the lockfile
is committed. **Remotion is separately licensed**: individuals and companies with
**up to 3 employees (含 3 人)** may use the Free License, including commercial video
creation; larger for-profit organizations need the appropriate Company License.
See the [pinned license](https://github.com/remotion-dev/remotion/blob/v4.0.523/LICENSE.md)
and [official licensing terms](https://www.remotion.dev/docs/license). This
toolkit's MIT license does not replace Remotion's terms.


## Galanty self-proof film / 文影自证片

The neutral demo above is unchanged. The owner-supplied Galanty example is a
separate, authored 30-second 16:9 film in Chinese and English, focused on
**Agent chat → code edit → preview at the changed second → export when ready**.
It uses the current three-bar/line-end-play mark, not the neutral geometric Z.
See [the source ledger](examples/galanty-sources.md) and [credits](CREDITS.md).
The illustrated player is clearly labeled; it is not an App recording or a
latency benchmark. HyperFrames is shown for opening/playback; the export shot
specifically uses a Remotion project.

```sh
npm run film:self-proof -- --language zh --output ./build/delivery
npm run film:self-proof -- --language en --output ./build/delivery
# Optional, user-supplied local nine-frame study sheet (never bundled):
# add --reference /path/to/local-nine-frame-sheet.png
```

Run the language jobs serially: they share generated storyboard/music and build
paths. Each job independently renders twice, checks the final MP4 and copies the
film, nine frames, contact sheet, plan and reports into its language directory.
`--render-only` is for a first visual preview; it does not produce delivery-check
approval. Use the normal command for final checks after the source is settled.
Do not operate an installed Galanty/QA App where the user has excluded it; provide
the changed timestamp and review the real rendered frames instead. The optional
local reference comparison is study material and must not be publicly distributed.
