# big-dom-generator

## Install

```bash
$ npm install big-dom-generator
```

## Usage

To use the big-dom-generator package in a javascript project, you can import the CSS file like this:

```javascript
import "big-dom-generator/generated.css";
```

This will import the generated.css file from the big-dom-generator package and apply the styles to your web page.

Alternatively, you can include the CSS file in your HTML file using a link tag:

```html
<link rel="stylesheet" href="node_modules/big-dom-generator/generated.css" />
```

To use the angular version of the big-dom-generator package in an Angular project, you can follow these steps:

1. Install the package using npm:

```bash
$ npm install @big-dom-generator/angular
```

2. Import the CSS file in your Angular component:

```javascript
import "@big-dom-generator/angular/big-dom-generator.css";
```

Alternatively, you can include the CSS file in your angular.json file:

```json
{
    "projects": {
        "my-app": {
            "architect": {
                "build": {
                    "options": {
                        "styles": ["node_modules/@big-dom-generator/angular/big-dom-generator.css"]
                    }
                }
            }
        }
    }
}
```

# License

CC-BY-4.0 © 2023 Issack John
