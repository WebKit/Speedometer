import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './components/app';

import './app.css';

const fs = require('fs');

const html = 
`<!DOCTYPE html>
<html lang="en" class="spectrum spectrum--medium spectrum--light">
  <head>
    <title>Big Todo App</title>
    <link rel="stylesheet" href="app.css">
  </head>
  <body>
    ${renderToStaticMarkup(<App />)}
  </body>
</html>`;
fs.writeFileSync('dist/index.html', html);