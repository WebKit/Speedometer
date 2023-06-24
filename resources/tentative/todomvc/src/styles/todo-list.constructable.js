const sheet = new CSSStyleSheet();
sheet.replaceSync(":host {\n    display: block;\n\tbox-shadow: none !important;\n}\n\n.todo-list {\n\tmargin: 0;\n\tpadding: 0;\n\tlist-style: none;\n\tdisplay: block;\n\tborder-top: 1px solid #e6e6e6;\n}");
export default sheet;
