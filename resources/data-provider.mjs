const DEFAULT_CONFIG_PATH = "/resources/config.json";

export async function parseConfig() {
    console.log("parseConfig()");
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get("config");
    const response = await fetch(configParam ?? DEFAULT_CONFIG_PATH);
    const config = await response.json();

    console.log("config", config);

    return {
        suites: [],
        tags: []
    };
}
