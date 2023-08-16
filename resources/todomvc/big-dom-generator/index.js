import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./src/app";

const fs = require("fs");

const html = `<!DOCTYPE html>
<html lang="en" class="spectrum spectrum--medium spectrum--light">
  <head>
    <title>Big Todo App</title>
    <link rel="stylesheet" href="big-dom-generator.css">
  </head>
  <body>
    <object data="Smock_TaskList_18_N.svg" type="image/svg+xml" hidden></object>
    ${renderToStaticMarkup(<App />)}
  </body>
</html>`;
fs.writeFileSync("dist/index.html", html);
