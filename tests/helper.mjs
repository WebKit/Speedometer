import commandLineUsage from "command-line-usage";
import commandLineArgs from "command-line-args";
import serve from "./server.mjs";

import { Builder, Capabilities, logging } from "selenium-webdriver";

const optionDefinitions = [
    { name: "browser", type: String, description: "Set the browser to test, choices are [safari, firefox, chrome]. By default the $BROWSER env variable is used." },
    { name: "port", type: Number, defaultValue: 8010, description: "Set the test-server port, The default value is 8010." },
    { name: "help", alias: "h", description: "Print this help text." },
];

function printHelp(message = "", exitStatus = 0) {
    const usage = commandLineUsage([
        {
            header: "Run all tests",
        },
        {
            header: "Options",
            optionList: optionDefinitions,
        },
    ]);
    if (message) {
        console.error(message);
        console.error();
    }
    console.log(usage);
    process.exit(exitStatus);
}

export default async function testSetup(helpText) {
    const options = commandLineArgs(optionDefinitions);

    if ("help" in options)
        printHelp(helpText);

    const BROWSER = options?.browser;
    if (!BROWSER)
        printHelp("No browser specified, use $BROWSER or --browser", 1);

    let capabilities;
    switch (BROWSER) {
        case "safari":
            capabilities = Capabilities.safari();
            break;

        case "firefox": {
            capabilities = Capabilities.firefox();
            break;
        }
        case "chrome": {
            capabilities = Capabilities.chrome();
            break;
        }
        case "edge": {
            capabilities = Capabilities.edge();
            break;
        }
        default: {
            printHelp(`Invalid browser "${BROWSER}", choices are: "safari", "firefox", "chrome", "edge"`);
        }
    }
    const prefs = new logging.Preferences();
    prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL); // Capture all log levels
    capabilities.setLoggingPrefs(prefs);

    const PORT = options.port;
    const server = await serve(PORT);
    let driver;

    process.on("unhandledRejection", (err) => {
        console.error(err);
        process.exit(1);
    });
    process.once("uncaughtException", (err) => {
        console.error(err);
        process.exit(1);
    });
    process.on("exit", () => stop());

    driver = await new Builder().withCapabilities(capabilities).build();
    driver.manage().window().setRect({ width: 1200, height: 1000 });

    function stop() {
        server.close();
        if (driver)
            driver.close();
    }
    return { driver, PORT, stop };
}
