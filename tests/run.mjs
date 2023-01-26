import serve from "./server.mjs";
import { Builder, Capabilities } from "selenium-webdriver";
import assert from "assert";

// To run this locally you'll need the browsers installed along with the corresponding driver:
// - chromedriver (https://chromedriver.chromium.org/getting-started)
// - geckodriver (https://github.com/mozilla/geckodriver/releases)
// - safaridriver (https://developer.apple.com/documentation/webkit/testing_with_webdriver_in_safari).

// Then you can run with the `BROWSER` environment variable, for example:
// BROWSER=chrome node tests/unit-test-run.mjs
// BROWSER=firefox node tests/unit-test-run.mjs
// BROWSER=safari node tests/unit-test-run.mjs

const PORT = 8010;
const server = serve(PORT);

let driver;

async function test() {
    let capabilities;
    switch (process.env.BROWSER) {
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
    }

    driver = await new Builder().withCapabilities(capabilities).build();

    try {
        await driver.get(`http://localhost:${PORT}/tests/index.html`);
        console.log("Waiting for tests to finish");
        await driver.wait(function () {
            return driver.executeScript(
                "return window.mochaResults.state === 'stopped'"
            );
        }, 5000);
        console.log("Checking for passed tests");
        assert(
            (await driver.executeScript(
                "return window.mochaResults.stats.passes"
            )) > 0
        );
        console.log("Checking for failed tests");
        assert(
            (await driver.executeScript(
                "return window.mochaResults.stats.failures"
            )) == 0
        );
    } catch (e) {
        throw e;
    } finally {
        console.log("Tests complete");
        driver.quit();
        server.close();
    }
}

process.on("unhandledRejection", (err) => {
    console.error(err);
    process.exit(1);
});
process.once("uncaughtException", (err) => {
    console.error(err);
    process.exit(1);
});

setImmediate(test);
