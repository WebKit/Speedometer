// Writes dist/resources.txt, the manifest the Stormbox-React suite entry
// in suites-experimental/suites.mjs declares. Run by "npm run build".
import { generateResourcesFile } from "../../../resources/shared/generate-resources.mjs";

generateResourcesFile(new URL("../dist", import.meta.url).pathname);
