const sheet = new CSSStyleSheet();
sheet.replaceSync(":host {\n    display: block;\n    box-shadow: none !important;\n}\n\n.footer {\n    margin: 65px auto 0;\n    color: #4d4d4d;\n    font-size: 11px;\n    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);\n    text-align: center;\n}\n\n.footer-text {\n    line-height: 1;\n}\n\n.footer-link {\n    color: inherit;\n    text-decoration: none;\n    font-weight: 400;\n}\n\n.footer-link:hover {\n    text-decoration: underline;\n}\n");
export default sheet;
