import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './app';
import { genCss } from './gen-css'

import './app.css';

const fs = require('fs');

const randomCss = genCss();
fs.writeFileSync('src/react-todomvc/public/matchingCss.css', randomCss.matchingCss);
fs.writeFileSync('src/react-todomvc/public/nonMatchingCss.css', randomCss.nonMatchingCss);

const html = 
`<!DOCTYPE html>
<html lang="en" class="ui spectrum spectrum--medium spectrum--light">
  <head>
    <title>Big Todo App</title>
    <link rel="stylesheet" href="app.css">
  </head>
  <body class="ui">
    ${renderToStaticMarkup(<App />)}
  </body>
</html>`;
fs.writeFileSync('generator-dist/index.html', html);