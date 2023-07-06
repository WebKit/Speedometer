const fs = require("fs");

function getHtmlContent(filePath) {
    let htmlContent = fs.readFileSync(filePath, "utf8");
    const bodyStartIndex = htmlContent.indexOf("<body>");
    const bodyEndIndex = htmlContent.lastIndexOf("</body>");
    if (bodyStartIndex < 0 || bodyEndIndex < 0)
        return htmlContent;

    return htmlContent.substring(bodyStartIndex + 6, bodyEndIndex);
}

module.exports = { getHtmlContent };
