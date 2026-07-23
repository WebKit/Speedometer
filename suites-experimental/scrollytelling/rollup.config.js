/*
 * Copyright (C) 2024 Apple Inc. All rights reserved.
 * Copyright (C) 2024 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";
import fs from "fs";
import process from "process";

const DEV_OUTPUT_DIR = "build-dev";
const PROD_OUTPUT_DIR = "dist";

const outputDir = process.env.ROLLUP_WATCH ? DEV_OUTPUT_DIR : PROD_OUTPUT_DIR;

if (!process.env.ROLLUP_WATCH && fs.existsSync(outputDir)) {
    // Clean previous build output
    fs.rmSync(outputDir, { recursive: true, force: true });
}

export default {
    input: "src/main.js",
    output: [
        {
            file: `${outputDir}/app.js`,
            format: "es",
            name: "app",
            plugins: process.env.ROLLUP_WATCH ? [] : [terser()],
        },
    ],
    plugins: [
        resolve(),
        copy({
            targets: [
                { src: "index.html", dest: `${outputDir}/` },
                { src: "src/styles.css", dest: `${outputDir}/` },
                { src: "public/*", dest: `${outputDir}/public/`, noErrorOnMissing: true },
            ],
        }),
    ],
};
