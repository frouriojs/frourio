import aspidaBuild from 'aspida/dist/cjs/buildTemplate';
import fs from 'fs';
import { expect, test, vi } from 'vitest';
import { version } from '../package.json';
import { run } from '../src';
import build from '../src/buildServerFile';

test('version command', () => {
  const spyLog = vi.spyOn(console, 'log');
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
      const result1 = build(input);
      const result2 = build(`./${input}`);
      const result3 = build(input.replace('/', '\\'));
      const result4 = build(`.\\${input.replace('/', '\\')}`);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
      expect(result3).toEqual(result4);

      expect(result1.text).toBe(
        fs
          .readFileSync(result1.filePath, 'utf8')
          .replace(/\r/g, '')
          .replace(/\n +\/\/ @ts-expect-error/g, ''),
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
