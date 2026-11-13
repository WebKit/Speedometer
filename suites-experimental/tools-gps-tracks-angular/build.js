// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as esbuild from 'esbuild';
import { readFile, writeFile, mkdir, copyFile, cp, rm, readdir } from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { generateResourcesFile } from '../../resources/shared/generate-resources.mjs';

const args = process.argv.slice(2);
const watch = args.includes('--watch');

const baseConfig = {
  bundle: true,
  minify: !watch,
  sourcemap: true,
  format: 'esm',
  target: ['es2020'],
  outdir: 'dist',
  assetNames: '[name]',
  outExtension: { '.js': '.mjs' },
  define: {
    ngDevMode: 'false',
  },
  loader: {
    '.woff2': 'file',
    '.png': 'file',
    '.svg': 'file',
  },
};

async function copyStaticAssets() {
  const assets = [
    { src: 'src/index.html', dest: 'index.html' },
    { src: 'material_symbols_rounded.woff2', dest: 'material_symbols_rounded.woff2' },
  ];
  await mkdir('dist', { recursive: true });

  for (const asset of assets) {
    try {
      await copyFile(asset.src, path.join('dist', asset.dest));
      console.log(`Copied ${asset.src} to dist/${asset.dest}`);
    } catch (e) {
      console.warn(`Could not copy ${asset.src}: ${e.message}`);
    }
  }

  try {
    await cp('test-data', path.join('dist', 'test-data'), { recursive: true });
    console.log('Copied test-data to dist/test-data');
  } catch (e) {
    console.warn(`Could not copy test-data: ${e.message}`);
  }
}

async function collectLicenses() {
  const deps = ['uplot', 'fit-file-parser', '@angular/core', 'rxjs', 'zone.js'];
  let output = '';

  try {
    const rootLicense = await readFile('LICENSE', 'utf-8');
    output += `TOOLS-GPS-TRACKS-ANGULAR LICENSE\n===========\n\n${rootLicense}\n\n`;
  } catch (e) {}

  for (const dep of deps) {
    try {
      let content;
      try {
        content = await readFile(path.join('node_modules', dep, 'LICENSE'), 'utf-8');
      } catch {
        content = await readFile(path.join('node_modules', dep, 'LICENSE.txt'), 'utf-8');
      }
      output += `\n\n------------------------------------------------------------------------------\n${dep.toUpperCase()} LICENSE\n------------------------------------------------------------------------------\n\n${content}\n`;
    } catch (e) {
      console.warn(`Could not find license for ${dep}`);
    }
  }

  output += `\n\n------------------------------------------------------------------------------\nBUNDLED FONT ASSETS LICENSE (MATERIAL SYMBOLS)\n------------------------------------------------------------------------------\n\n`;
  output += `Assets: material_symbols_rounded.woff2 (and hashed build assets)\n`;
  output += `Copyright Google LLC\n\n`;
  output += `Licensed under the Apache License, Version 2.0 (the "License");\n`;
  output += `you may not use these assets except in compliance with the License.\n`;
  output += `You may obtain a copy of the License at\n\n`;
  output += `    http://www.apache.org/licenses/LICENSE-2.0\n\n`;
  output += `Unless required by applicable law or agreed to in writing, software\n`;
  output += `distributed under the License is distributed on an "AS IS" BASIS,\n`;
  output += `WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n`;
  output += `See the License for the specific language governing permissions and\n`;
  output += `limitations under the License.\n\n`;
  output += `MODIFICATION AND SUBSETTING NOTICE (Apache License 2.0, Section 4(b)):\n`;
  output += `These font binaries are subsetted and modified derivatives of the original\n`;
  output += `Google Material Symbols font files, containing only the\n`;
  output += `specific glyphs and icons utilized by the Tools-GPS-Tracks-Angular benchmark workload.\n`;

  try {
    const testDataDir = path.join('dist', 'test-data');
    let testFiles = [];
    try {
      const manifestPath = path.join(testDataDir, 'manifest.json');
      const manifestData = JSON.parse(await readFile(manifestPath, 'utf-8'));
      testFiles = Array.isArray(manifestData) ? [...manifestData, 'manifest.json'] : [];
    } catch (e) {
      testFiles = await readdir(testDataDir);
    }

    output += `\n\n------------------------------------------------------------------------------\nBUNDLED GPS TEST TRACKS LICENSE (dist/test-data/*)\n------------------------------------------------------------------------------\n\n`;
    output += `Bundled synthetic GPS test track files:\n`;
    testFiles.sort().forEach((file) => {
      output += `- dist/test-data/${file}\n`;
    });
    output += `\nBSD 3-Clause License\n\n`;
    output += `Copyright (c) 2026, Camillo Bruni / Speedometer Contributors\n\n`;
    output += `Redistribution and use in source and binary forms, with or without\n`;
    output += `modification, are permitted provided that the following conditions are met:\n\n`;
    output += `1. Redistributions of source code must retain the above copyright notice, this\n`;
    output += `   list of conditions and the following disclaimer.\n\n`;
    output += `2. Redistributions in binary form must reproduce the above copyright notice,\n`;
    output += `   this list of conditions and the following disclaimer in the documentation\n`;
    output += `   and/or other materials provided with the distribution.\n\n`;
    output += `3. Neither the name of the copyright holder nor the names of its\n`;
    output += `   contributors may be used to endorse or promote products derived from\n`;
    output += `   this software without specific prior written permission.\n\n`;
    output += `THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"\n`;
    output += `AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n`;
    output += `IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE\n`;
    output += `DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE\n`;
    output += `FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL\n`;
    output += `DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR\n`;
    output += `SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER\n`;
    output += `CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,\n`;
    output += `OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\n`;
    output += `OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n`;
  } catch (e) {
    console.warn(`Could not collect bundled GPS test track licenses: ${e.message}`);
  }

  await mkdir('dist', { recursive: true });
  await writeFile(path.join('dist', 'LICENSE'), output);
  console.log('Generated dist/LICENSE with NPM dependencies and bundled data assets.');
}

function generateTestData() {
  console.log('Generating synthetic GPS track test data...');
  execSync('node scripts/generate-test-data.mjs', { stdio: 'inherit' });
}

async function build() {
  await rm('dist', { recursive: true, force: true });
  generateTestData();

  // 1. Bundle main app code
  const ctxWeg = await esbuild.context({
    ...baseConfig,
    entryPoints: ['src/app.ts'],
    entryNames: 'tools-gps-tracks-angular',
    external: ['uplot', 'fit-file-parser'],
  });

  const ctxOverride = await esbuild.context({
    ...baseConfig,
    entryPoints: ['src/benchmark-override.ts'],
    entryNames: 'benchmark-override',
  });

  // 2. Bundle Vendors
  const vendorEntryPoints = {
    uplot: 'node_modules/uplot/dist/uPlot.esm.js',
    'fit-file-parser': 'src/vendor-fit.ts',
  };

  const vendorCtxs = await Promise.all(
    Object.entries(vendorEntryPoints).map(([name, entry]) =>
      esbuild.context({
        ...baseConfig,
        entryPoints: [entry],
        entryNames: name,
      }),
    ),
  );

  // 3. Bundle CSS
  const ctxCss = await esbuild.context({
    ...baseConfig,
    entryPoints: ['src/css/styles.css'],
    entryNames: 'styles',
  });

  if (watch) {
    await copyStaticAssets();
    await Promise.all([
      ctxWeg.watch(),
      ctxOverride.watch(),
      ctxCss.watch(),
      ...vendorCtxs.map((c) => c.watch()),
    ]);
    await generateResourcesFile(path.join(import.meta.dirname, 'dist'));

    const { host, port } = await ctxWeg.serve({
      servedir: 'dist',
      fallback: 'index.html',
    });
    console.log(`Development server: http://${host}:${port}`);
  } else {
    await Promise.all([
      ctxWeg.rebuild(),
      ctxOverride.rebuild(),
      ctxCss.rebuild(),
      ...vendorCtxs.map((c) => c.rebuild()),
    ]);

    await copyStaticAssets();
    await collectLicenses();

    await Promise.all([
      ctxWeg.dispose(),
      ctxOverride.dispose(),
      ctxCss.dispose(),
      ...vendorCtxs.map((c) => c.dispose()),
    ]);

    await generateResourcesFile(path.join(import.meta.dirname, 'dist'));
    console.log('Build complete. Production files and resources.txt are in dist/');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
