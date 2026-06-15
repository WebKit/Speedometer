# Cooking With Lit and TailwindCSS

A single-page cooking website built with [Lit](https://lit.dev/) and [Tailwind CSS](https://tailwindcss.com/).

## Table of Contents

-   [Introduction](#introduction)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Production](#production)
-   [Project Structure](#project-structure)
-   [Components](#components)
-   [Data Sources](#data-sources)

## Introduction

This project is a responsive cooking website that showcases recipes, articles, and cooking videos. It is built using Lit for efficient web components and Tailwind CSS for styling. The app features interactive components like a chat window, recipe cards, and a video grid, providing users with an engaging experience.

## Installation

Ensure you have [Node.js](https://nodejs.org/en) installed.

```bash
npm install
```

## Usage

To run the app in development mode with live reloading:

```bash
npm run dev
```

The script above runs the following commands concurrently, scanning your template files for classes, build your CSS, and launch the development server:

-   Tailwind CSS for Main Styles:

    ```bash
    npm run dev:main-css
    ```

    Compiles input.css into tailwind.generated.css and watches for changes.

-   Tailwind CSS for Chat Window Styles:

    ```bash
    npm run dev:chat-window-css
    ```

    Compiles styles specific to the chat window into tailwind.chat-window.generated.css.

-   Rollup watch

    ```bash
    npm run dev:rollup
    ```

    Bundles the JavaScript files using Rollup and watches for changes.

-   Development Server
    ```bash
    npm run dev:serve
    ```
    Runs a development server with live reloading

Access the app at http://localhost:8000 (default port).

## Production

To build and serve the production version of the app, run the following command:

```bash
npm run build
npm run serve
```

The command will:

-   Compile and minify the CSS files.
-   Bundle and minify JavaScript files using Rollup.
-   Copy necessary assets to the `dist/` directory.

## Project Structure

```
├── dist/                               # Production build output
├── public/                             # Public assets like images
├── src/
│   ├── data/                           # Data files (recipes, articles, etc.)
│   ├── lib/
│   │   └── components/                 # Lit components
│   ├── input.css                       # Tailwind CSS input file
│   └── app.js                          # Main JavaScript entry point
├── index.html                          # Main HTML file
├── package.json                        # NPM configuration
├── tailwind.chat-window.config.js      # Tailwind CSS configuration
├── tailwind.config.js                  # Tailwind CSS configuration
└── rollup.config.js                    # Rollup bundler configuration
```

## Components

#### CookingApp (cooking-app.js)

The root component that composes all other components to build the app interface.

## Data Sources

The app uses static data files located in the `src/data/` directory:

## Icons

The icons used in this project are from [Heroicons](https://github.com/tailwindlabs/heroicons/blob/master/LICENSE).
