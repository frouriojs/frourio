import fs from 'fs'
import path from 'path'
import { cleanStaleRouteDir, isStaleRouteDir } from './cleanStaleRoutes'

export default (dir: string): void => {
  const dfs = (dir: string) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
      if (entry.isDirectory()) dfs(path.resolve(dir, entry.name))
    })
    if (isStaleRouteDir(dir)) {
      cleanStaleRouteDir(dir)
    }
  }
  dfs(path.resolve(dir, 'api'))
}
