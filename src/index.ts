import watch from 'aspida/dist/watchInputDir';
import write from 'aspida/dist/writeRouteFile';
import minimist from 'minimist';
import build from './buildServerFile';
import cleanAll from './cleanAllStaleRoutes';
import clean from './cleanStaleRoutes';

export const run = (args: string[]) => {
  const argv = minimist(args, {
    string: ['version', 'watch', 'project'],
    alias: { v: 'version', w: 'watch', p: 'project' }
  });
  const dir = '.';

  if (argv.version !== undefined) {
    console.log(`v${require('../package.json').version}`);
  } else if (argv.watch !== undefined) {
    cleanAll(dir);
    write(build(dir, argv.project));
    watch(dir, (event, file) => {
      clean(dir, event, file);
      write(build(dir, argv.project));
    });
  } else {
    cleanAll(dir);
    write(build(dir, argv.project));
  }
};
