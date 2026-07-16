import { execSync } from "child_process";
import path from "path";

execSync("npm run build:nuxt", { stdio: "inherit", cwd: path.join(import.meta.dirname, "..") });
