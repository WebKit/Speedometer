const sheet = new CSSStyleSheet();
sheet.replaceSync(":host {\n    display: block;\n    box-shadow: none !important;\n}\n\n.todo-list {\n    margin: 0;\n    padding: 0;\n    list-style: none;\n    display: block;\n    border-top: 1px solid #e6e6e6;\n}\n");
export default sheet;
