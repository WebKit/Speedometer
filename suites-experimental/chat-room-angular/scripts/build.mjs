import { execSync } from "child_process";
import path from "path";
import { generateResourcesFile } from "../../../resources/shared/generate-resources.mjs";

const root = path.join(import.meta.dirname, "..");

execSync("npx ng build", { stdio: "inherit", cwd: root });

generateResourcesFile(path.join(root, "dist"));
