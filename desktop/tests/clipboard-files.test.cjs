'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { readClipboardFiles } = require('../clipboard-files.cjs');
const options = (files, size = 3) => ({ platform:'win32', executeImpl: async (program, args, opts) => {
  assert.match(program, /helpers[\\/]game-process-helper\.exe$/); assert.equal(opts.windowsHide, true);
  assert.deepEqual(args, ['--clipboard-files']); assert.notEqual(opts.shell, true);
  return { stdout:JSON.stringify(files) };
}, fsImpl:{ stat:async () => ({ isFile:() => true, size }), readFile:async () => Buffer.from('abc') } });
test('Explorer file clipboard supports up to twelve files with names, MIME and bytes', async () => {
  const files = await readClipboardFiles(12, options(Array.from({length:12}, (_, i) => `C:\\files\\${i}.png`)));
  assert.equal(files.length, 12); assert.equal(files[0].name, '0.png'); assert.equal(files[0].type, 'image/png');
  assert.equal(Buffer.from(files[0].data).toString(), 'abc');
});
test('clipboard rejects oversize and excess files instead of silently truncating', async () => {
  await assert.rejects(readClipboardFiles(1, options(['a.txt','b.txt'])), /1 more file/);
  assert.equal((await readClipboardFiles(12, options(['at-limit.bin'], 100*1024*1024))).length, 1);
  await assert.rejects(readClipboardFiles(12, options(['too-large.bin'], 100*1024*1024+1)), /100 MB/);
  assert.deepEqual(await readClipboardFiles(0, options(['a.txt'])), []);
});

test('clipboard helper uses a fixed STA native mode and never accepts renderer commands or paths', async () => {
  const source = require('../scripts/benchmark-games.cjs').HELPER_SOURCE;
  assert.match(source, /\[STAThread\]/);
  assert.match(source, /Clipboard\.GetFileDropList\(\)/);
  assert.match(source, /args\.Length == 1 && args\[0\] == "--clipboard-files"/);
  const folder = options(['folder']); folder.fsImpl.stat = async () => ({ isFile: () => false, size: 0 });
  await assert.rejects(readClipboardFiles(12, folder), /folders cannot be attached/);
  const unsupported = options(['a.txt']); unsupported.platform = 'darwin';
  unsupported.executeImpl = () => { throw Error('Must not launch'); };
  assert.deepEqual(await readClipboardFiles(12, unsupported), []);
});
