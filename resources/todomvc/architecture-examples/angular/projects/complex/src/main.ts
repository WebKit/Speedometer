import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "shared-library";

import "big-dom-generator/dist/app.css";
import "big-dom-generator/angular/generated.css";
import "big-dom-generator/public/layout.css";

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));