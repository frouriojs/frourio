import minimist from 'minimist'
import getConfig, { Config } from '../getConfig'
import write from '../writeRouteFile'
import watch from './watchInputDir'
import { Build, Watch, CommandToBuild } from './build'
import { Command, nullCommand } from './command'
import { version as versionCommand } from './version'

export const options: minimist.Opts = {
  string: ['version', 'config', 'build', 'watch'],
  alias: { v: 'version', c: 'config', b: 'build', w: 'watch' }
}

const getBuildCommandFactory = (configs: Config[]) =>
  CommandToBuild.getFactory(configs, { write, watch })

export const run = (args: string[]) => {
  const argv = minimist(args, options)

  const commands: Command[] = [
    argv.version !== undefined ? versionCommand : nullCommand,
    argv.build !== undefined || argv.watch !== undefined
      ? getBuildCommandFactory(getConfig(argv.config)).create(
          argv.watch !== undefined ? new Watch() : new Build()
        )
      : nullCommand
  ]

  commands.forEach(c => c.exec())
}
