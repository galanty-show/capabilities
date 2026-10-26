# Contributing capability packs

Talkframe capability packs are data-first extensions. A contribution lives in `capabilities/<id>/` and uses a stable dotted id such as `science.timeline`.

## Pack structure

- `capability.json` contains the id, integer version, distribution tier, name, summary, selection guidance, JSON inputs, asset slots, timing, examples, license, author and implementation metadata.
- `example-storyboard.json` is a complete storyboard that exercises the capability and passes the standalone contract validator.
- `definition.json` is required for an L1 declarative implementation. It may use only the bounded elements, actions, expressions, simulations and checks accepted by the current contract.
- L2 packs may add licensed data assets described by `capability.json`. Network-loaded assets and executable code are not accepted.
- L3 code implementations are reviewed and maintained in the private engine. This repository may list their inert metadata, but does not contain their source code.

Keep paths relative to the repository. Do not include local absolute paths, private documents, job output, credentials, or product-specific brand assets.

## Licensing

Every contribution must use MIT or CC BY 4.0. The repository's contracts, validation tools, reusable tools, and sample/template source code use MIT. Original skill text, production notes, prompts, storyboards and other content use CC BY 4.0 unless a file's own notice states otherwise. Existing built-in capability metadata and data examples retain their recorded licenses. Third-party media, fonts, music and marks keep their own licenses; neither repository license re-licenses them. Record the real author and source for contributed assets; a signature or metadata field does not prove originality.

Run the repository validation workflow before requesting review. Structural validation confirms contract compatibility. Maintainers separately review licensing, scope and content quality before a pack enters the verified index.

## Submission

Open a pull request containing one focused capability or template change and its example. Explain the intended use, limits, license, validation result and any visual checks that remain.

Submission without a GitHub account is planned. The signed file-based intake flow is not available yet; until it is documented here, no alternate upload channel is supported.

## Video sources, skills and production notes

For a sample, preserve its source/asset manifest and CREDITS alongside the code. State whether each asset may be redistributed; a license to use music inside a video does not necessarily allow publishing the audio file. Record AI generation tools and methods when used, and redact private paths, credentials and personal information from prompts and logs. Missing production cost or timing records must say “not recorded”, rather than zero.

Skills should work with the public App MCP interface and the `@galanty/mcp` bridge, without requiring private engine source files or a contributor's machine layout. Experience notes should distinguish measured results, historical observations, recommendations and unresolved limitations. Creative timing or style recommendations must not become gates for opening, previewing or annotating a normal project.
