// Simple server adapted from https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework:
import * as fs from "fs";
import * as http from "http";
import * as path from "path";
import commandLineArgs from "command-line-args";
import esMain from 'es-main';

const MIME_TYPES = {
    default: "application/octet-stream",
    html: "text/html; charset=UTF-8",
    txt: "text/plain".
    js: "application/javascript; charset=UTF-8",
    mjs: "application/javascript; charset=UTF-8",
    css: "text/css",
    png: "image/png",
    jpg: "image/jpg",
    gif: "image/gif",
    ico: "image/x-icon",
    svg: "image/svg+xml",
};

const STATIC_PATH = path.join(process.cwd(), "./");
const toBool = [() => true, () => false];
export default function serve(port) {
    if (!port)
        throw new Error("Port is required");
    const prepareFile = async (url) => {
        const paths = [STATIC_PATH, url];
        if (url.endsWith("/"))
            paths.push("index.html");
        const filePath = path.join(...paths);
        let found = false;
        let ext = "txt";
        let stream = undefined;
        if (!filePath.startsWith(STATIC_PATH))
            return { found, ext, stream };
        found = await fs.promises.access(filePath).then(...toBool).catch(() => false);
        if (!found)
            return { found, ext, stream };
        const isFile = (await fs.promises.lstat(filePath)).isFile();
        const streamPath = isFile ? filePath : `${filePath}/index.html`;
        found = await fs.promises.access(streamPath).then(...toBool).catch(() => false);
        if (found) {
            console.log(streamPath)
            ext = path.extname(streamPath).substring(1).toLowerCase();
            stream = fs.createReadStream(streamPath);
        }
        return { found, ext, stream };
    };

    const server = http
        .createServer(async (req, res) => {
            const url = new URL(req.url);
            const file = await prepareFile(req.url);
            const statusCode = file.found ? 200 : 404;
            const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
            const headers = {
                "Content-Type": mimeType,
                "Cross-Origin-Embedder-Policy": "require-corp",
                "Cross-Origin-Opener-Policy": "same-origin",
            };
            res.writeHead(statusCode, headers);
            if (file.found)
                file.stream.pipe(res);
            else {
                res.write(``)
                res.end();
            }
        })
        .listen(port);

    console.log(`Server running at http://127.0.0.1:${port}/`);
    return server;
}


function main() {
    const optionDefinitions = [
        { name: "port", type: Number, defaultValue: 8080, description: "Set the test-server port, The default value is 8010." },
    ];
    const options = commandLineArgs(optionDefinitions);
    serve(options.port);
}

if (esMain(import.meta))
    main();
