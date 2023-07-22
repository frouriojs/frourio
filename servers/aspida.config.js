const fs = require('fs');

module.exports = fs
  .readdirSync('.', { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => ({ input: `${d.name}/api` }));
