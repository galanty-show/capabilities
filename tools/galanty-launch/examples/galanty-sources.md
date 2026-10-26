# Galanty launch film · source ledger

Verified 2026-10-21. This ledger maps **every shot** in the Chinese and English
briefs to the live site and owner-supplied internal planning and site-copy documents (not public). Website
requests succeeded with HTTPS; their full HTML snapshots are retained only in
the local delivery's `sources/`, not the public package. Internal documents
were read in a read-only snapshot supplied by the owner.

## Preview-first

Shots 2 and 6: **预览优先 / Preview first**. This is the explicit editorial priority
in the owner's internal plan for this skill (“头号原则：预览优先”, not public):
after each Agent edit, open Galanty at the changed second before final export.
[Chinese homepage](https://galanty.cn/#story), hero and third modification-loop
step, say the film resumes from the same second after the Agent's change.
[English homepage](https://galanty.cn/en/#story) says the Agent finishes, Galanty
opens the film and plays from the change. The film says “改完，立即看” as a workflow
instruction; **it does not claim measured zero latency**. Performance targets,
cold-start/seek/HMR numbers and claimed percentage savings are deliberately
absent: no accepted five-run benchmark exists yet.

## Own-agent

Shots 1 and 3: use **your own Agent**. The live homepages' Agent sections name
Claude Code, Codex and Gemini CLI; the owner's
Agent guide source copy (Chinese: introduction and “本地帮助与批注交接”; English:
introduction; published at galanty.cn/agents/) explains that the user connects their own existing
Agent/model service. These names identify compatibility, not a partnership.
“把 12.5 秒的标题换成荧光绿 / Make the title at 12.5s lime” is original demonstration
dialogue, not a quoted real user request or a test transcript.

## Preview-loop

Shots 4 and 5: **Agent dialogue → a focused code edit → Galanty playback at that
second**. The homepages' hero and modification-loop step 3 support the resumption
behavior; the source-plan preview-first principle supports chat as the primary
feedback surface. Code diff, example title and time `12.5s` are authored workflow
illustrations. The visual time is a content timestamp, **not a measured duration**.
Both languages label illustrated UI and explicitly disclaim performance measurement.
No installed App or QA instance was operated for this production. A deep-link dry
run or code-drawn animation is not evidence of successful App playback.

## Open-projects

Shot 7: open Remotion projects, HyperFrames / HTML animations and ordinary video
files. The owner's Agent guide copy (galanty.cn/agents/), “Before creating”
/ “创作前”, states that existing projects can be opened directly without conversion.
The owner's internal product rules (“产品铁律”, “核心只做一条回路”, not public)
explicitly name Remotion, HTML/HyperFrames and video-file adapters; the public
repository README's “文影的修改回路 / The Galanty loop” independently lists
MP4/MOV/WebM. The **main-repository README** was read as requested, but still opens
with the older document-to-narrated-video positioning and links to the site and
manuals; it does not establish the newer compatibility claims by itself.

Scope: the film shows opening/playback. It does **not** imply native Galanty MP4
export for HyperFrames/HTML: that path remains planned in the public README;
use the HTML project's own renderer. “打开你的工程 / Bring your project” is the
product compatibility intention, not a guarantee that malformed projects or
missing third-party dependencies run without repair.

## Export-mp4

Shot 8: **preview first, export MP4 when ready**. Both live homepages list MP4
export. the owner's product description prepared for app review (section 2, how it works step 5, not public)
explicitly says local preview, editing and MP4 export; `agents.md` and
`agents.en.md` separate compile/live play from requested export. The shot says
“Remotion 工程 · 本机导出 / Remotion project · local export” so it does not extend
this claim to the planned HTML export path. No pricing or paid-tier claims appear.

## Tagline

Shot 9: exact live Chinese title/hero **改一处，回到那一秒** and English title/hero
**Change one thing. Back to that second.** verified at
[galanty.cn](https://galanty.cn/) and [galanty.cn/en/](https://galanty.cn/en/).
The current three-bar/line-end-play brand geometry and lime `#C9F65A` are copied
from the owner-supplied source, with attribution in [CREDITS.md](../CREDITS.md).

## Editorial and verification boundary

The 30-second film, the title “让想法发光 / Let ideas glow”, typography, camera
motion, three-step numbered loop and local electronic score are original creative
choices. Neither demo code nor terminal text invokes a real user project.
The delivered `check.json` validates the actual final media, not App compatibility,
third-party Agent login, installation publication, founder approval or runtime
performance. Local reference comparison is study material, not distribution media.
