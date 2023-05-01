import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './components/app';

import './app.css';

// const loadIcons = require('loadicons');
const fs = require('fs');
// loadIcons('@spectrum-css/icon/dist/spectrum-css-icons.svg');
// loadIcons("@adobe/spectrum-css-workflow-icons/dist/spectrum-icons.svg");

const html = 
`<!DOCTYPE html>
<html lang="en" class="spectrum spectrum--medium spectrum--light">
  <head>
    <title>Big Todo App</title>
    <link rel="stylesheet" href="app.min.css">
  </head>
  <body>
    ${renderToStaticMarkup(<App />)}
  </body>
</html>`;
fs.writeFileSync('dist/index.html', html);