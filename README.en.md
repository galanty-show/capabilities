<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/banner-light.svg">
  <img src="assets/banner-light.svg" alt="Galanty 文影 — Change one thing. Back to that second. 让视频制作更简单。" width="1280" height="320">
</picture>

# Galanty · Creative resources & tools

[简体中文](README.md) · **English**

**Open resources for making videos with your own Agent.**

[Website](https://galanty.cn/en/) · [Samples](https://galanty.cn/en/samples/) · Mac App Store — coming soon · [Agent guide](https://galanty.cn/en/agents/)

## Galanty Launch · A 30-second product film

Turn a repository or README into a sourced, beat-driven launch film, then preview every edit at its changed second.

> **30-second GIF placeholder / Demo pending:** a real recording of “project input → code-drawn scenes → review an edit at 12.5 seconds” will go here. No demo GIF is published here yet.

Choose one of three installation methods. Plugins bundle the workflow and CLI MCP configuration; standalone skills do not include MCP. Obtain the standalone toolkit separately. Requires Node.js 20+ (22+ for the toolkit). **The remote commands below are publication entrypoints. Until this branch is pushed, use the local alternatives; these commands do not establish that this version is live.**

**skills.sh (multiple agents)**

```sh
npx skills add galanty-show/capabilities --list
npx skills add galanty-show/capabilities --skill galanty-launch
```

**Claude Code plugin**

```sh
npm install -g @galanty/cli
claude plugin marketplace add galanty-show/capabilities
claude plugin install galanty-launch@galanty-capabilities
```

Invoke `/galanty-launch:galanty-launch` in a session. Replace the source in the marketplace command with `.` to install the local checkout's marketplace from its root.

**Codex plugin**

```sh
npm install -g @galanty/cli
codex plugin marketplace add galanty-show/capabilities
codex plugin add galanty-launch@galanty-capabilities
```

Use a current Codex CLI supporting `plugin add`; replace the marketplace command's source with `.` for the local marketplace. Alternatively, ask `$skill-installer` to install `skills/galanty-launch` from this repository as a standalone skill. The plugin launches a local stdio MCP server with `npx -y @galanty/cli mcp`, exposing 15 tools without the App. Start a new session after installation. Using the Agent itself still requires your own service login. [Official skills guide](https://learn.chatgpt.com/docs/build-skills) · [Official plugin guide](https://developers.openai.com/plugins/build/plugins).

### Before npm publication: install the CLI tarball

`@galanty/cli` is not published to npm yet. The first line in each plugin block above is for after publication. Obtain `galanty-cli-0.1.0.tgz` from the maintainer, install it in a separate directory, and run Claude Code / Codex from that directory so the plugin's `npx` can resolve the local package:

```sh
mkdir cli-preview && cd cli-preview
npm install "file:../galanty-cli-0.1.0.tgz"
npx -y @galanty/cli --help
```

For this temporary local install, preview with `npx -y @galanty/cli open <project> --at <seconds>`; bare `galanty` becomes available after a global install. Then run the matching marketplace and plugin installation commands; for a local checkout, replace the marketplace source with its directory. Do not rely on registry downloads before publication. The tarball is not distributed in this repository.

<!-- TODO: Remove the entire CLI tarball section after @galanty/cli is published to npm. -->

### Two preview routes

- **With the App:** after each edit, open the project in Galanty, bring it to the foreground and seek to the changed second. Use `galanty open <project> --at <seconds> --app`, or the existing toolkit's `npm run preview -- --at 12.5`.
- **Without the App:** use `galanty open <project> --at <seconds>` to check the change in the CLI browser player at that second. Pass the project's absolute path; add `--no-browser` to print the link only.

### Known limitations

- Public directory submissions with local stdio MCP require an allowlisted organization and are Desktop only. Local marketplace structure checks do not establish public directory eligibility. See the [official submission restrictions](https://developers.openai.com/plugins/deploy/desktop-only). This package does not bypass the allowlist.
- Codex validation here covers manifest structure only, without login or model invocation. The CLI tarball's independent MCP connection and host loading are separate checks.
- Registry and remote plugin commands require publication of the package and branch. Local verification does not establish remote availability.

**Create a project, then preview and seek with one command.** The creator is not published to npm. Pack it locally from this repository's root:

```sh
mkdir -p .lane-data/packages
npm pack ./tools/galanty-launch/create --pack-destination .lane-data/packages
npx --yes --package ./.lane-data/packages/create-galanty-launch-0.1.0.tgz create-galanty-launch my-launch
cd my-launch
npm ci
npm run preview -- --at 12.5
```

Requires Node 22+, FFmpeg 6+ and ffprobe. The package bundles the complete template, lockfile, fonts and skill; it refuses existing targets and installs no App. Preview opens and seeks in Galanty when installed; otherwise it opens Remotion Studio, where you seek manually. Rendering does not require Galanty. See the [toolkit guide](tools/galanty-launch/README.md) for export and checks. The intended `npx create-galanty-launch my-launch` registry command requires a separate npm publication; use the local tarball today.

Toolkit code uses MIT. [Remotion has separate terms](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md): individuals, for-profit organizations with up to 3 employees, and nonprofits qualify under the free terms; other organizations must check the Company License. Fonts retain OFL notices. License checked on 2026-10-21. [Distribution checks and limitations](docs/distribution/README.md).

## The Galanty loop

| 01 · Open & play | 02 · Annotate | 03 · Hand off | 04 · Resume | 05 · Export |
| --- | --- | --- | --- | --- |
| Open your original video or project. | Write a note at the moment. | Give it to your Agent. | Check the change from the same second. | Export when you're happy. |

Galanty opens Remotion projects, HyperFrames / HTML animations, Galanty projects and MP4 / MOV / WebM files. Its own format is recommended, never required for playback or annotation. HTML / HyperFrames export within Galanty is planned; use the project's own rendering tool for now. To change a video file, your Agent needs its original project or another editing tool.

This public repository contains **creative resources and standalone tools**. The application engine is distributed separately; download the installer from the [website](https://galanty.cn/en/).

## What's in this repository

| Path | Contents |
| --- | --- |
| [samples/](samples/) | Text source, prompts, making notes and complete Release ZIP links for 52 reviewed samples. |
| [docs/experience/](docs/experience/) | Production experience, practical pitfalls and reusable techniques. |
| [capabilities/](capabilities/) | Visual capability references and examples. |
| [templates/](templates/) | Topic templates and style references. |
| [contracts/](contracts/) | Storyboard, visual capability and transition format references. |
| [skills/](skills/) | Agent workflow references. |
| [community/](community/) | Community index. |
| [tools/galanty-launch/](tools/galanty-launch/) | Product launch starter: fictional demo, original music, double-render checks and 15 internal evaluation briefs; [skill entry](skills/galanty-launch/SKILL.md). |
| [tools/beat-sync-promo/](tools/beat-sync-promo/) | A standalone beat-synced promo tool: single-page HTML, measured beat grids, frame-by-frame rendering and subframe motion blur. |

The standalone **`beat-sync-promo`** tool does not require the Galanty engine. It uses Node, Python / numpy, ffmpeg and a Chromium browser. See its [README](tools/beat-sync-promo/README.md) for setup and usage.

Existing storyboard and scene conventions here are reference material, not required formats for bringing an external project into Galanty.

## Create, play and refine

- **Start with a template or your own project.** Copy a template, replace its content, or ask your Agent to write React / TSX scenes with your own layout, motion and colors.
- **Start from words when you want to.** Describe an idea or import PDF, Word or Markdown; your chosen Agent can turn the content into a storyboard. You can also bring an existing storyboard.
- **Choose the sound your film needs.** Combine voice-over, music and subtitles, or let the visuals and music tell the story. Play first, then refine color, voice and timing.
- **Bring your Agent.** Claude Code, Codex or another compatible MCP client can use Galanty's tools to find templates, write storyboards, edit scenes and return a playback link. For stdio without the App, use `npx -y @galanty/cli mcp` with Node.js 20+; install the tarball above before npm publication. [Agent guide →](https://galanty.cn/en/agents/)
- **Keep the local work local.** Default voice-over and rendering run on your Mac; projects stay on your computer. Content sent to an external Agent or optional cloud voice service goes to the service you choose.

The [sample gallery](https://galanty.cn/en/samples/) contains **50 samples in 8 categories**: Kids' Stories, Classic Tales, Poetry & Culture, Product Promos, Explainers, Data & Reports, Everyday Notices and About Galanty. Chinese and English pages show the available language versions, with prompts and source download entries.

**Apple silicon Mac, macOS 13 or later.** The Mac App Store version is coming soon; download the direct version from the [website](https://galanty.cn/en/).

## Planned open formats

`video-review` is planned for timestamped annotations; `video-recipe` is planned for reproducible making records. Their public specifications are not yet published standards. These formats will be optional; external projects do not need Galanty's storyboard or scene conventions to open, play or receive annotations.

## Contribute & license

Questions, suggestions and improvements are welcome through [Issues](https://github.com/galanty-show/capabilities/issues) and [Pull requests](https://github.com/galanty-show/capabilities/pulls). See [CONTRIBUTING.md](CONTRIBUTING.md).

- Contracts, tools and CI: [MIT](LICENSE-MIT).
- Capability packs, templates, examples and media: [CC BY 4.0](LICENSE-CC-BY-4.0); each directory's license takes precedence for its files.
- Only contribute material you have the right to share publicly.
- These resource licenses do not license the private application engine.

Sample folders in Git contain text only. Use the ZIP linked in each sample README for complete playable source and media. New samples follow `galanty://schema/storyboard` from the running app; the legacy v2 references in `contracts/` do not validate these v3-lite samples. Sample code follows each folder's LICENSE, including upstream licenses.
