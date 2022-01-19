import fs from 'fs'
import path from 'path'

const isManagedJSTSFile = (filepath: string): boolean => {
  return Boolean(filepath.match(/^\$.*\.[mc]?[jt]s$/))
}

export const isStaleRouteDir = (routeDir: string): boolean => {
  try {
    const entries = fs.readdirSync(routeDir, { withFileTypes: true })
    if (entries.length === 0) return false
    for (const p of entries) {
      if (p.isDirectory()) return false
      if (!isManagedJSTSFile(p.name)) return false
    }
    return true
  } catch (e: unknown) {
    return false
  }
}

export const cleanStaleRouteDir = (routeDir: string) => {
  try {
    const entries = fs.readdirSync(routeDir, { withFileTypes: true })
    if (entries.length === 0) return
    for (const p of entries) {
      if (p.isDirectory()) return
      if (!isManagedJSTSFile(p.name)) return
      fs.unlinkSync(path.resolve(routeDir, p.name))
    }
    fs.rmdirSync(routeDir)
  } catch (e: unknown) {}
}

export default (dir: string, event: string, file: string): void => {
  if (event !== 'unlink' && event !== 'unlinkDir') return
  const routeDir = path.dirname(path.resolve(dir, file))

  if (isStaleRouteDir(routeDir)) {
    cleanStaleRouteDir(routeDir)
  }
}
