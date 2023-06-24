const sheet = new CSSStyleSheet();
sheet.replaceSync(":host {\n    display: block;\n\tbox-shadow: none !important;\n\tmin-height: 68px;\n}\n\n.app {\n\tbackground: #fff;\n\tmargin: 24px 16px 40px 16px;\n\tposition: relative;\n\tbox-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2),\n\t            0 25px 50px 0 rgba(0, 0, 0, 0.1);\n}\n");
export default sheet;
