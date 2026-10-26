import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, registerRoot, staticFile, useCurrentFrame, delayRender, continueRender, cancelRender} from 'remotion';
import {loadFont} from '@remotion/fonts';
import * as UI from './primitives';
import type {Project, Scene} from './types';

if (typeof document !== 'undefined') {
  const handle = delayRender('Bundled OFL fonts');
  Promise.all([
    loadFont({family: 'Launch Sans', url: staticFile('fonts/noto-sans-latin.woff2'), weight: '100 900'}),
    loadFont({family: 'Launch CJK', url: staticFile('fonts/noto-sans-sc-common.woff2'), weight: '100 900'}),
  ]).then(async () => {
    await document.fonts.ready;
    const loaded = [...document.fonts].filter((font) => font.family.replace(/["']/g, '').startsWith('Launch '));
    if (loaded.length !== 2 || loaded.some((font) => font.status !== 'loaded')) throw new Error(`Bundled fonts did not load: ${[...document.fonts].map((font) => `${font.family}:${font.status}`).join(', ')}`);
    console.log('LAUNCH_FONTS_READY:2'); continueRender(handle);
  }).catch((error) => cancelRender(error));
}

const Shot: React.FC<{project: Project; scene: Scene}> = ({project, scene}) => {
  const frame = useCurrentFrame();
  const {brief} = project;
  const Component = UI[scene.primitive as keyof typeof UI] as React.ComponentType<UI.LaunchProps>;
  return <AbsoluteFill style={{fontFamily: '\"Launch Sans\", \"Launch CJK\"', color: brief.palette.foreground}}>
    <Component frame={frame} durationInFrames={scene.durationInFrames} fps={project.fps} bpm={project.grid.bpm} brief={brief} scene={scene} />
  </AbsoluteFill>;
};

const Launch: React.FC<{project: Project}> = ({project}) => <AbsoluteFill style={{background: project.brief.palette.background}}>
  <Audio src={staticFile(project.music)} />
  {project.brief.demoLabel ? <div style={{position: 'absolute', zIndex: 20, top: 24, right: 36, padding: '10px 18px', background: '#111218ee', border: '2px solid #fff5e6', color: '#fff5e6', fontSize: 28, fontWeight: 800, letterSpacing: 2, fontFamily: '"Launch Sans", "Launch CJK"'}}>{project.brief.demoLabel}</div> : null}
  {project.scenes.map((scene) => <Sequence key={scene.id} from={scene.from} durationInFrames={scene.durationInFrames}><Shot project={project} scene={scene} /></Sequence>)}
</AbsoluteFill>;

const placeholder = {version: 1, fps: 30, width: 1920, height: 1080, durationInFrames: 720, scenes: []} as unknown as Project;
const Root = () => <Composition id="Launch" component={Launch} width={1920} height={1080} fps={30} durationInFrames={720} defaultProps={{project: placeholder}}
  calculateMetadata={async () => {
    const response = await fetch(staticFile('generated/project.json'));
    if (!response.ok) throw new Error('Run npm run plan first to generate the storyboard and music');
    const project = await response.json() as Project;
    return {durationInFrames: project.durationInFrames, fps: project.fps, width: project.width, height: project.height, props: {project}};
  }} />;
registerRoot(Root);
