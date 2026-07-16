import { execSync } from "child_process";
import path from "path";

execSync("npm run build:next", { stdio: "inherit", cwd: path.join(import.meta.dirname, "..") });
