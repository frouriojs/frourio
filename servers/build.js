const fs = require('fs');
const path = require('path');
const write = require('aspida/dist/cjs/writeRouteFile').default;
const build = require('../dist/buildServerFile').default;

fs.readdirSync(__dirname, { withFileTypes: true }).forEach(dir => {
  if (dir.isDirectory()) write(build(path.join(__dirname, dir.name)));
});
