import {Config} from '@remotion/cli/config';

Config.setEntryPoint('./scenes/index.tsx');
Config.setOutputLocation('build/direct.mp4');
Config.setVideoImageFormat('png');
Config.setPort(4391);
