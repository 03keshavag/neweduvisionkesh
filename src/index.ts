import {registerRoot} from 'remotion';
import {RemotionRoot} from './remotion/Root';

// Entry point for Remotion. Registers the composition tree so that
// `remotion studio` and `remotion render` can discover all compositions.
registerRoot(RemotionRoot);
