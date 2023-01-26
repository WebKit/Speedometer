

// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework:
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';

const PORT = 8010;
const MIME_TYPES = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  mjs: 'application/javascript; charset=UTF-8',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
};

const STATIC_PATH = path.join(process.cwd(), './');

const toBool = [() => true, () => false];

const prepareFile = async (url) => {
  const paths = [STATIC_PATH, url];
  if (url.endsWith('/')) paths.push('index.html');
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(STATIC_PATH);
  const exists = await fs.promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  const streamPath = found ? filePath : STATIC_PATH + '/README.md';
  const ext = path.extname(streamPath).substring(1).toLowerCase();
  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream };
};

const server = http.createServer(async (req, res) => {
  const file = await prepareFile(req.url);
  const statusCode = file.found ? 200 : 404;
  const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
  res.writeHead(statusCode, { 'Content-Type': mimeType });
  file.stream.pipe(res);
  console.log(`${req.method} ${req.url} ${statusCode}`);
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);

import {
  Builder,
  By,
  Capabilities,
} from "selenium-webdriver";
import assert from "assert";

let driver;

async function test() {
  let capabilities;
  switch (process.env.BROWSER) {
    case 'safari':
      capabilities = Capabilities.safari();
      capabilities.set('safari.options', { technologyPreview: false });
      break;

    case 'firefox': {
      capabilities = Capabilities.firefox().setLoggingPrefs({ browser: 'ALL' });
      break;
    }
    case 'chrome': {
      capabilities = Capabilities.chrome().setLoggingPrefs({ browser: 'ALL' });
      // capabilities.set('chromeOptions', { });
      break;
    }
  }

  driver = await new Builder().withCapabilities(capabilities).build();

  try {
    await driver.get(`http://localhost:${PORT}/tests/index.html`);
    await driver.wait(function () {
      return driver.executeScript("return window.mochaResults.state === 'stopped'");
    }, 5000);
    assert(await driver.executeScript("return window.mochaResults.stats.passes") > 0);
    assert(await driver.executeScript("return window.mochaResults.stats.failures") == 0);
  } catch (e) {
    throw e;
  } finally {
    driver.quit();
    server.close();
  }
}

process.on('unhandledRejection', err => {
  console.error(err);
  process.exit(1);
});
process.once('uncaughtException', err => {
  console.error(err);
  process.exit(1);
});

setImmediate(test);
