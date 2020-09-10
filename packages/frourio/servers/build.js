const fs = require('fs')
const write = require('aspida/dist/writeRouteFile').default
const build = require('../dist/buildServerFile').default

fs.readdirSync(__dirname, { withFileTypes: true }).forEach(dir => {
  if (dir.isDirectory()) write(build(`${__dirname}/${dir.name}`))
})
