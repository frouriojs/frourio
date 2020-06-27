import fs from 'fs'
import path from 'path'

export const listFiles = (targetDir: string): string[] =>
  fs.readdirSync(targetDir, { withFileTypes: true }).flatMap(dirent => {
    const target = path.posix.join(targetDir, dirent.name)
    return dirent.isFile()
      ? [targetDir.startsWith('.') ? `./${target}` : target]
      : listFiles(target)
  })
