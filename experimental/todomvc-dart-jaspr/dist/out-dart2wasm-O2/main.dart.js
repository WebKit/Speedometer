(async () => {
const thisScript = document.currentScript;

function relativeURL(ref) {
  const base = thisScript?.src ?? document.baseURI;
  return new URL(ref, base).toString();
}

let { compileStreaming } = await import("./main.mjs");

let app = await compileStreaming(fetch(relativeURL("main.wasm")));
let module = await app.instantiate({});
module.invokeMain();

})();
