import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "src", "data");

const files = fs
    .readdirSync(dataDir)
    .filter((f) => /^\d{4}\.js$/.test(f))
    .sort((a, b) => {
        const yearA = parseInt(a.replace(".js", ""), 10);
        const yearB = parseInt(b.replace(".js", ""), 10);
        return yearA - yearB;
    });

// Process each file to ensure its internal data items are sorted by date
files.forEach((file) => {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const jsonStr = content.replace(/^export default\s+/, "").replace(/;\s*$/, "");

    try {
        // Evaluate the JS content to get the array
        const arr = eval(`(${jsonStr})`);
        if (!Array.isArray(arr)) {
            console.warn(`File ${file} does not export an array, skipping sorting.`);
            return;
        }

        // Sort items by date
        let modified = false;
        const sortedArr = [...arr].sort((a, b) => {
            if (!a.date || !b.date) return 0;
            if (a.date < b.date) return -1;
            if (a.date > b.date) return 1;
            return 0;
        });

        // Check if sorting actually changed order
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id !== sortedArr[i].id) {
                modified = true;
                break;
            }
        }

        if (modified) {
            console.log(`Sorting items in ${file}...`);
            const newContent = `export default ${JSON.stringify(sortedArr, null, 4)};\n`;
            fs.writeFileSync(filePath, newContent, "utf-8");
        }
    } catch (e) {
        console.error(`Error processing/sorting ${file}:`, e.message);
    }
});

let imports = "";
let exportsList = "export default [\n";

files.forEach((file) => {
    const year = file.replace(".js", "");
    imports += `import data${year} from "./${file}";\n`;
    exportsList += `    ...data${year},\n`;
});

exportsList += "];\n";

const content = `${imports}\n${exportsList}`;
fs.writeFileSync(path.join(dataDir, "index.js"), content, "utf-8");
console.log(`Generated index.js with ${files.length} year files.`);
