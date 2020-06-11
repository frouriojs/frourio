import fs from 'fs'
import path from 'path'

const listFiles = (targetDir: string) => {
  const list: string[] = []

  fs.readdirSync(targetDir).forEach(file => {
    const target = path.posix.join(targetDir, file)

    if (fs.statSync(target).isFile()) {
      list.push(target)
    } else {
      list.push(...listFiles(target))
    }
  })

  return list
}

export default listFiles
