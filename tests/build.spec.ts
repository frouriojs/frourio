import aspidaBuild from 'aspida/dist/cjs/buildTemplate';
import fs from 'fs';
import { version } from '../package.json';
import { run } from '../src';
import build from '../src/buildServerFile';

test('version command', () => {
  const spyLog = jest.spyOn(console, 'log');
  const args = ['--version'];

  run(args);
  expect(console.log).toHaveBeenCalledWith(`v${version}`);

  spyLog.mockRestore();
});

test('build', () => {
  const inputDir = 'servers';

  fs.readdirSync(inputDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => `${inputDir}/${d.name}`)
    .forEach(input => {
      const result = build(input);
      expect(result.text).toBe(
        fs
          .readFileSync(result.filePath, 'utf8')
          .replace(/\r/g, '')
          .replace(/\n +\/\/ @ts-expect-error/g, '')
      );

      const [target] = aspidaBuild({
        input: `${input}/api`,
        baseURL: '',
        trailingSlash: false,
        outputEachDir: false,
        outputMode: 'all',
      });
      expect(target.text).toBe(fs.readFileSync(target.filePath, 'utf8').replace(/\r/g, ''));
    });
});
