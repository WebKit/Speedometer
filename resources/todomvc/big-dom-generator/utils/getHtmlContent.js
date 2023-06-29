const fs = require("fs");

function getHtmlContent(filePath, isComplex = false) {
    let htmlContent = fs.readFileSync(filePath, "utf8");
    if (isComplex) {
        const bodyStartIndex = htmlContent.indexOf("<body>") + 6;
        const bodyEndIndex = htmlContent.indexOf("</body>");
        htmlContent = htmlContent.substring(bodyStartIndex, bodyEndIndex);
    }
    return htmlContent;
}

module.exports = { getHtmlContent };
