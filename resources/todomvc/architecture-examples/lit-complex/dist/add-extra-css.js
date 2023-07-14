const additionalStyleSheets = [];

additionalStyleSheets[0] = new CSSStyleSheet();
additionalStyleSheets[0].replaceSync(`li {
	border-top-color: var(--complex-border-top-color-0, var(--complex-border-top-color-default));
	border-left-color: var(--complex-border-left-color-0, var(--complex-border-left-color-default));}

li > div {
	outline-color: var(--complex-outline-color-0, var(--complex-outline-color-default));
	border-color: var(--complex-border-color-0, var(--complex-border-color-default));}`);

additionalStyleSheets[1] = new CSSStyleSheet();
additionalStyleSheets[1].replaceSync(`li {
	border-left-color: var(--complex-border-left-color-1, var(--complex-border-left-color-default));
	text-decoration-color: var(--complex-text-decoration-color-1, var(--complex-text-decoration-color-default));}

li > div {
	border-color: var(--complex-border-color-1, var(--complex-border-color-default));
	border-bottom-color: var(--complex-border-bottom-color-1, var(--complex-border-bottom-color-default));}`);

additionalStyleSheets[2] = new CSSStyleSheet();
additionalStyleSheets[2].replaceSync(`li {
	column-rule-color: var(--complex-column-rule-color-2, var(--complex-column-rule-color-default));
	border-color: var(--complex-border-color-2, var(--complex-border-color-default));}

li > div {
	border-bottom-color: var(--complex-border-bottom-color-2, var(--complex-border-bottom-color-default));
	accent-color: var(--complex-accent-color-2, var(--complex-accent-color-default));}`);

additionalStyleSheets[3] = new CSSStyleSheet();
additionalStyleSheets[3].replaceSync(`li {
	border-color: var(--complex-border-color-3, var(--complex-border-color-default));
	text-decoration-color: var(--complex-text-decoration-color-3, var(--complex-text-decoration-color-default));}

li > div {
	accent-color: var(--complex-accent-color-3, var(--complex-accent-color-default));
	outline-color: var(--complex-outline-color-3, var(--complex-outline-color-default));}`);

additionalStyleSheets[4] = new CSSStyleSheet();
additionalStyleSheets[4].replaceSync(`li {
	outline-color: var(--complex-outline-color-4, var(--complex-outline-color-default));
	border-right-color: var(--complex-border-right-color-4, var(--complex-border-right-color-default));}

li > div {
	border-left-color: var(--complex-border-left-color-4, var(--complex-border-left-color-default));
	text-decoration-color: var(--complex-text-decoration-color-4, var(--complex-text-decoration-color-default));}`);

additionalStyleSheets[5] = new CSSStyleSheet();
additionalStyleSheets[5].replaceSync(`li {
	border-right-color: var(--complex-border-right-color-5, var(--complex-border-right-color-default));
	accent-color: var(--complex-accent-color-5, var(--complex-accent-color-default));}

li > div {
	column-rule-color: var(--complex-column-rule-color-5, var(--complex-column-rule-color-default));
	border-left-color: var(--complex-border-left-color-5, var(--complex-border-left-color-default));}`);

additionalStyleSheets[6] = new CSSStyleSheet();
additionalStyleSheets[6].replaceSync(`li {
	border-bottom-color: var(--complex-border-bottom-color-6, var(--complex-border-bottom-color-default));
	text-decoration-color: var(--complex-text-decoration-color-6, var(--complex-text-decoration-color-default));}

li > div {
	border-left-color: var(--complex-border-left-color-6, var(--complex-border-left-color-default));
	border-top-color: var(--complex-border-top-color-6, var(--complex-border-top-color-default));}`);

additionalStyleSheets[7] = new CSSStyleSheet();
additionalStyleSheets[7].replaceSync(`li {
	text-decoration-color: var(--complex-text-decoration-color-7, var(--complex-text-decoration-color-default));
	accent-color: var(--complex-accent-color-7, var(--complex-accent-color-default));}

li > div {
	border-top-color: var(--complex-border-top-color-7, var(--complex-border-top-color-default));
	border-color: var(--complex-border-color-7, var(--complex-border-color-default));}`);

additionalStyleSheets[8] = new CSSStyleSheet();
additionalStyleSheets[8].replaceSync(`li {
	accent-color: var(--complex-accent-color-8, var(--complex-accent-color-default));
	border-top-color: var(--complex-border-top-color-8, var(--complex-border-top-color-default));}

li > div {
	border-color: var(--complex-border-color-8, var(--complex-border-color-default));
	border-left-color: var(--complex-border-left-color-8, var(--complex-border-left-color-default));}`);

additionalStyleSheets[9] = new CSSStyleSheet();
additionalStyleSheets[9].replaceSync(`li {
	border-top-color: var(--complex-border-top-color-9, var(--complex-border-top-color-default));
	border-left-color: var(--complex-border-left-color-9, var(--complex-border-left-color-default));}

li > div {
	border-right-color: var(--complex-border-right-color-9, var(--complex-border-right-color-default));
	outline-color: var(--complex-outline-color-9, var(--complex-outline-color-default));}`);;

window.extraCssToAdopt = additionalStyleSheets;
