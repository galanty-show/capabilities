# create-galanty-launch

Create a complete standalone Remotion launch-film project, with its locked dependencies, scripts, local OFL fonts and Agent workflow. Node 22+, npm, FFmpeg 6+ and ffprobe are required. This package is not published to npm yet.

From the repository root, build and use the local package:

```sh
mkdir -p .lane-data/packages
npm pack ./tools/galanty-launch/create --pack-destination .lane-data/packages
npx --yes --package ./.lane-data/packages/create-galanty-launch-0.1.0.tgz create-galanty-launch my-launch
```

Use the actual tarball path printed by `npm pack` if the version changes. The package never overwrites an existing directory, installs dependencies automatically, starts an App, or renders on creation.

```sh
cd my-launch
npm ci
npm run preview -- --at 12.5
```

The preview command prepares the project, opens Galanty and seeks when it is installed; otherwise it uses Remotion Studio. The first browser download and dependency installation require network. Use `--dry-run` to inspect a preview plan without opening an App.

The intended command after a separately authorized npm publication is `npx create-galanty-launch my-launch`; it is not a currently verified registry install. Template code uses MIT; bundled canonical skill content retains CC BY 4.0 with attribution to Talkframe / Galanty contributors (see generated `LICENSE-SKILL-CC-BY-4.0`); fonts retain OFL notices. These licenses grant no trademark rights. [Remotion has separate terms](https://www.remotion.dev/docs/license).
