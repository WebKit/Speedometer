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
    { name: "port", type: Number, defaultValue: 0, description: "Set the test-server port. The default value is 0 (dynamic port)." },
    { name: "retry", type: Number, defaultValue: DEFAULT_RETRIES, description: "Number of retries for the tests on failure." },
    { name: "headless", type: Boolean, description: "Run browser in headless mode. Automatically enabled on Linux when $DISPLAY and $WAYLAND_DISPLAY are unset." },
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

export function detectHeadless(options) {
    if (options?.headless)
        return true;

    if (process.platform === "linux" && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY)
        return true;

    return false;
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

    const isHeadless = detectHeadless(options);

    let builder;
    switch (BROWSER) {
        case "safari": {
            if (isHeadless)
                console.warn("Warning: --headless is not supported with safari, running in windowed mode.");

            builder = new Builder().forBrowser(BROWSER);
            // No bidi and log support in safari.
            break;
        }
        case "firefox": {
            const firefoxOptions = new firefox.Options().enableBidi();
            if (isHeadless)
                firefoxOptions.addArguments("--headless");

            builder = new Builder().forBrowser(BROWSER).setFirefoxOptions(firefoxOptions);
            break;
        }
        case "chrome": {
            const chromeOptions = new chrome.Options().enableBidi();
            if (isHeadless)
                chromeOptions.addArguments("--headless");

            builder = new Builder().forBrowser(BROWSER).setChromeOptions(chromeOptions);
            break;
        }
        case "edge": {
            const edgeOptions = new edge.Options().enableBidi();
            if (isHeadless)
                edgeOptions.addArguments("--headless");

            builder = new Builder().forBrowser(BROWSER).setEdgeOptions(edgeOptions);
            break;
        }
        default: {
            printHelp(`Invalid browser "${BROWSER}", choices are: "safari", "firefox", "chrome", "edge"`);
        }
    }
    const { server, port } = await serve(options.port);
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

    if (BROWSER !== "safari") {
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
    return { driver, port, stop, retry: options.retry };
}
