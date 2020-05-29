import { Config } from '../getConfig'
import build, { Template } from '../buildTemplate'
import { Command } from './command'

export class CommandToBuild implements Command {
  static getFactory(configs: Config[], io: BuildIO) {
    return {
      create(command: BuildCommand): Command {
        return new CommandToBuild(command, configs, io)
      }
    }
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(
    private readonly command: BuildCommand,
    private readonly configs: Config[],
    private readonly io: BuildIO
  ) {}

  exec() {
    this.configs.forEach(config => {
      this.command.run(config, this.io)
    })
  }
}

type BuildCommand = {
  run(config: Config, io: BuildIO): void
}

export type BuildIO = {
  write(template: Template): void
  watch(input: string, callback: () => void): void
}

export class Build implements BuildCommand {
  run(config: Config, io: BuildIO) {
    io.write(build(config))
  }
}

export class Watch implements BuildCommand {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly build = new Build()) {}

  run(config: Config, io: BuildIO) {
    this.build.run(config, io)
    io.watch(config.input, () => this.build.run(config, io))
  }
}
