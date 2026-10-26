# Sources and licenses

The toolkit code, demo brief and newly composed procedural music are MIT, under
the included LICENSE. No third-party audio samples, recordings, screenshots,
brand artwork or benchmark statistics are shipped in the neutral demo.
The dedicated Galanty self-proof example uses owner-supplied brand assets;
see [CREDITS.md](CREDITS.md) for attribution and trademark limits. The default Zelqio product,
features and commands are fictional, explicitly labeled DEMO / 示例 throughout.
Its source map is [examples/product.md](examples/product.md). All interface
drawings and the geometric Z mark are original. The four-stage counter counts
named workflow steps; the 16-trace grid is an illustrative workload, not measured
throughput or a concurrency ceiling. Real open-source products and their official
sources live only in `eval/` internal fixtures, not the default public demo.

The scene design was informed by the general sequencing of the S105 promo
(terminal / workspace / progressive reveal) and a local study of a third-party
promo film (terminal / editor / browser / growth). The implementation here is newly written,
parameterized and brand neutral. No source, music, claims or brand artwork of that
film was copied or redistributed.

Bundled fonts are an exception to the MIT code license: **SIL Open Font License
1.1**, with original copyrights and license texts in `public/fonts/`:

- Noto Sans, Latin variable subset, modified internal family “Talkframe Noto
  Sans”; 36,984 bytes.
- Noto Sans SC, GB2312 Han and punctuation variable subset, modified internal
  family “Talkframe Noto Sans SC”; 1,844,340 bytes.
- Upstream [Google Fonts revision
  809e4d8b8d7e9364a914909bb777679606c178b8](https://github.com/google/fonts/tree/809e4d8b8d7e9364a914909bb777679606c178b8/ofl).
  `public/fonts/manifest.json` preserves source/output SHA-256 and exact retained
  codepoints. The toolkit subsets the upstream fonts and renames the internal family; no glyph outlines are altered.
- Runtime CSS aliases are `Launch Sans` and `Launch CJK`. No system font is used
  by the built-in primitives. For uncovered characters, bundle an appropriate
  licensed font and extend the loader/manifest; `check` reports missing glyphs.

Remotion has its own license; it is **not MIT**. See the README and
[`remotion/LICENSE.md`](https://github.com/remotion-dev/remotion/blob/v4.0.523/LICENSE.md).
FFmpeg is an external user-installed prerequisite with its own license and build
options; it is not bundled here.
