const fs = require("fs");
const path = require("path");

function getHtmlContent(filePath) {
    let htmlContent = fs.readFileSync(filePath, "utf8");
    const bodyStartIndex = htmlContent.indexOf("<body>");
    const bodyEndIndex = htmlContent.lastIndexOf("</body>");
    if (bodyStartIndex < 0 || bodyEndIndex < 0) return htmlContent;

    htmlContent = htmlContent.substring(bodyStartIndex + 6, bodyEndIndex);
    htmlContent = injectHtmlIntoTodoArea(htmlContent, "../../complex/public/partial.html");
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
