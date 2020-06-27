import minimist from 'minimist'
import write from 'aspida/dist/writeRouteFile'
import watch from 'aspida/dist/cli/watchInputDir'
import { Command, nullCommand } from 'aspida/dist/cli/command'
import { version as versionCommand } from 'aspida/dist/cli/version'
import build from './buildServerFile'

const options: minimist.Opts = {
  string: ['version', 'dir', 'build', 'watch'],
  alias: { v: 'version', d: 'dir', b: 'build', w: 'watch' }
}

export const run = (args: string[]) => {
  const argv = minimist(args, options)
  const dirs = ((argv.dir as string) ?? '.').split(',')
  const commands: Command[] = [
    argv.version !== undefined ? versionCommand : nullCommand,
    argv.build !== undefined ? { exec: () => dirs.forEach(dir => write(build(dir))) } : nullCommand,
    argv.watch !== undefined
      ? {
          exec: () =>
            dirs.forEach(dir => {
              write(build(dir))
              watch(dir, () => write(build(dir)))
            })
        }
      : nullCommand
  ]

  commands.forEach(c => c.exec())
}
