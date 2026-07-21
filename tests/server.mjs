// Simple server for local testing.

import * as path from "path";
import commandLineArgs from "command-line-args";
import esMain from "es-main";
import LocalWebServer from "lws";
import "lws-cors";
import "lws-index";
import "lws-log";
import "lws-static";

const ROOT_DIR = path.join(process.cwd(), "./");

class CacheControlPlugin {
    middleware(config) {
        return async (ctx, next) => {
            ctx.set("Cache-Control", `max-age=${config.cache}`);
            await next();
        };
    }
}

export default async function serve(port, cacheDuration) {
    if (!port)
        throw new Error("Port is required");

    const stack = ["lws-log", "lws-cors", "lws-static", "lws-index"];
    if (cacheDuration !== undefined)
        stack.unshift(CacheControlPlugin);

    const ws = await LocalWebServer.create({
        port: port,
        hostname: "127.0.0.1",
        directory: ROOT_DIR,
        corsOpenerPolicy: "same-origin",
        corsEmbedderPolicy: "require-corp",
        logFormat: "dev",
        stack,
        cache: cacheDuration,
    });
    await verifyStartup(ws, port);

    process.on("exit", () => ws.server.close());

    return {
        close() {
            ws.server.close();
        },
    };
}

async function verifyStartup(ws, port) {
    await new Promise((resolve, reject) => {
        ws.server.on("listening", () => {
            console.log("Server started:");
            console.log(`  http://localhost:${port}`);
            console.log(`  http://localhost:${port}?developerMode`);
            console.log("");
            resolve();
        });
        ws.server.on("error", (e) => {
            console.error("Error while starting the server", e);
            reject(e);
        });
    });
}

function main() {
    const optionDefinitions = [
        { name: "port", type: Number, defaultValue: 8080, description: "Set the test-server port, The default value is 8080." },
        { name: "cache", type: Number, description: "Set the cache duration in seconds. If flag is present without a value, defaults to 3600." },
    ];
    const options = commandLineArgs(optionDefinitions);
    let cacheDuration = undefined;
    if ("cache" in options)
        cacheDuration = options.cache ?? 3600;

    serve(options.port, cacheDuration);
}

if (esMain(import.meta))
    main();
