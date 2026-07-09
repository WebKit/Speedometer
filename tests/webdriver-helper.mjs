import commandLineUsage from "command-line-usage";
import commandLineArgs from "command-line-args";
import serve from "./server.mjs";

import firefox from "selenium-webdriver/firefox.js";
import chrome from "selenium-webdriver/chrome.js";
import edge from "selenium-webdriver/edge.js";

import LogInspector from "selenium-webdriver/bidi/logInspector.js";
import { Builder } from "selenium-webdriver";

export const DEFAULT_RETRIES = 1;

const optionDefinitions = [
    { name: "browser", type: String, description: "Set the browser to test, choices are [safari, firefox, chrome]. By default the $BROWSER env variable is used." },
    { name: "port", type: Number, defaultValue: 8010, description: "Set the test-server port, The default value is 8010." },
    { name: "retry", type: Number, defaultValue: DEFAULT_RETRIES, description: "Number of retries for the tests on failure." },
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

    if (options.retry < 0)
        printHelp("Number of retries cannot be negative", 1);

    let builder;
    switch (BROWSER) {
        case "safari": {
            builder = new Builder().forBrowser(BROWSER);
            // No bidi and log support in safari.
            break;
        }
        case "firefox": {
            builder = new Builder().forBrowser(BROWSER);
            break;
        }
        case "chrome": {
            builder = new Builder().forBrowser(BROWSER).setChromeOptions(new chrome.Options().enableBidi());
            break;
        }
        case "edge": {
            builder = new Builder().forBrowser(BROWSER).setEdgeOptions(new edge.Options().enableBidi());
            break;
        }
        default: {
            printHelp(`Invalid browser "${BROWSER}", choices are: "safari", "firefox", "chrome", "edge"`);
        }
    }
    const PORT = options.port;
    const server = await serve(PORT);
    let driver, logInspector;

    process.on("unhandledRejection", (err) => {
        console.error(err);
        process.exit(1);
    });
    process.once("uncaughtException", (err) => {
        console.error(err);
        process.exit(1);
    });
    process.on("exit", () => stop());

    driver = await builder.build();
    driver.manage().window().setRect({ width: 1200, height: 1000 });

    if (BROWSER === "chrome" || BROWSER === "edge") {
        logInspector = await LogInspector(driver);
        await logInspector.onConsoleEntry((log) => {
            console.log(`${log.type}.${log.level}`.toUpperCase(), log.text);
        });
    }

    async function stop() {
        server.close();
        if (logInspector)
            await logInspector.close();
        if (driver)
            driver.close();
    }
    return { driver, PORT, stop, retry: options.retry };
}
