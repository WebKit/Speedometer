const fs = require("fs");
const path = require("path");

function getHtmlContent(filePath, isComplex = false) {
    let htmlContent = fs.readFileSync(filePath, "utf8");
    if (isComplex) {
        const bodyStartIndex = htmlContent.indexOf("<body>") + 6;
        const bodyEndIndex = htmlContent.indexOf("</body>");
        htmlContent = htmlContent.substring(bodyStartIndex, bodyEndIndex);
        htmlContent = injectHtmlIntoTodoArea(htmlContent, "../../complex/public/partial.html");
    }
    return htmlContent;
}

const injectHtmlIntoTodoArea = (htmlContent, partialFilePath) => {
    const partialHtml = fs.readFileSync(path.join(__dirname, partialFilePath), "utf8");
    const todoAreaRegex = /<div\s+class="todo-area"[^>]*>[\s\S]*?<\/div>/i;
    const todoAreaMatch = htmlContent.match(todoAreaRegex);
    if (todoAreaMatch) {
        const todoAreaHtml = todoAreaMatch[0];
        const newTodoAreaHtml = todoAreaHtml.replace(/<\/div>/i, `${partialHtml}\n</div>`);
        const newHtmlContent = htmlContent.replace(todoAreaRegex, newTodoAreaHtml);
        return newHtmlContent;
    } else {
        throw new Error("Could not find todo-area div in HTML content");
    }
};

module.exports = { getHtmlContent };
