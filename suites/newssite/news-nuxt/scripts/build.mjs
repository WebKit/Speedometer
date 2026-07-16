import { execSync } from "child_process";
import path from "path";
import { generateResourcesFile } from "../../../../resources/shared/generate-resources.mjs";

execSync("npm run build:nuxt", { stdio: "inherit", cwd: path.join(import.meta.dirname, "..") });

await generateResourcesFile(path.join(import.meta.dirname, "../dist"));
