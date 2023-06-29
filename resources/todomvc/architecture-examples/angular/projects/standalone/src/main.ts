import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "shared-library";

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
