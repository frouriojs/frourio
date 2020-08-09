import minimist from 'minimist'
import write from 'aspida/dist/writeRouteFile'
import watch from 'aspida/dist/watchInputDir'
import build from './buildServerFile'

export const run = (args: string[]) => {
  const argv = minimist(args, {
    string: ['version', 'dir', 'watch'],
    alias: { v: 'version', d: 'dir', w: 'watch' }
  })
  const dirs = ((argv.dir as string) ?? '.').split(',')

  argv.version !== undefined
    ? console.log(`v${require('../package.json').version}`)
    : argv.watch !== undefined
    ? dirs.forEach(dir => {
        write(build(dir))
        watch(dir, () => write(build(dir)))
      })
    : dirs.forEach(dir => write(build(dir)))
}
