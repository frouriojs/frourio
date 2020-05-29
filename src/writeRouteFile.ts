import fs from 'fs'
import { Template } from './buildTemplate'

export default ({ filePath, text }: Template) => {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === text) return

  fs.writeFileSync(filePath, text, 'utf8')
  console.log(`${filePath} was built successfully.`)
}
