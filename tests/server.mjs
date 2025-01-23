// Simple server for local testing.

import * as path from "path";
import commandLineArgs from "command-line-args";
import esMain from "es-main";
import LocalWebServer from "local-web-server";


const ROOT_DIR = path.join(process.cwd(), "./");

export default async function serve(port) {
    if (!port)
        throw new Error("Port is required");
    const ws = await LocalWebServer.create({
        port: port,
        directory: ROOT_DIR,
        corsOpenerPolicy: "same-origin",
        corsEmbedderPolicy: "require-corp",
    });
    console.log(`Server started on http://localhost:${port}`);
    process.on("exit", () => ws.server.close());
    return {
        close() {
            ws.server.close();
        }
    };
}

function main() {
    const optionDefinitions = [
        { name: "port", type: Number, defaultValue: 8080, description: "Set the test-server port, The default value is 8080." },
    ];
    const options = commandLineArgs(optionDefinitions);
    serve(options.port);
}

if (esMain(import.meta))
    main();
