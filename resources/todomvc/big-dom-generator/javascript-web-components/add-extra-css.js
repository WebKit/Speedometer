const additionalStyleSheets = [];

additionalStyleSheets[0] = new CSSStyleSheet();
additionalStyleSheets[0].replaceSync(`li {
	accent-color: var(--complex-accent-color-0, var(--complex-accent-color-default));
	border-bottom-color: var(--complex-border-bottom-color-0, var(--complex-border-bottom-color-default));
	border-color: var(--complex-border-color-0, var(--complex-border-color-default));
	border-left-color: var(--complex-border-left-color-0, var(--complex-border-left-color-default));
	border-right-color: var(--complex-border-right-color-0, var(--complex-border-right-color-default));
	border-top-color: var(--complex-border-top-color-0, var(--complex-border-top-color-default));
	column-rule-color: var(--complex-column-rule-color-0, var(--complex-column-rule-color-default));
	outline-color: var(--complex-outline-color-0, var(--complex-outline-color-default));
	text-decoration-color: var(--complex-text-decoration-color-0, var(--complex-text-decoration-color-default));}`);

additionalStyleSheets[1] = new CSSStyleSheet();
additionalStyleSheets[1].replaceSync(`li {
	accent-color: var(--complex-accent-color-1, var(--complex-accent-color-default));
	border-bottom-color: var(--complex-border-bottom-color-1, var(--complex-border-bottom-color-default));
	border-color: var(--complex-border-color-1, var(--complex-border-color-default));
	border-left-color: var(--complex-border-left-color-1, var(--complex-border-left-color-default));
	border-right-color: var(--complex-border-right-color-1, var(--complex-border-right-color-default));
	border-top-color: var(--complex-border-top-color-1, var(--complex-border-top-color-default));
	column-rule-color: var(--complex-column-rule-color-1, var(--complex-column-rule-color-default));
	outline-color: var(--complex-outline-color-1, var(--complex-outline-color-default));
	text-decoration-color: var(--complex-text-decoration-color-1, var(--complex-text-decoration-color-default));}`);

additionalStyleSheets[2] = new CSSStyleSheet();
additionalStyleSheets[2].replaceSync(`li {
	accent-color: var(--complex-accent-color-2, var(--complex-accent-color-default));
	border-bottom-color: var(--complex-border-bottom-color-2, var(--complex-border-bottom-color-default));
	border-color: var(--complex-border-color-2, var(--complex-border-color-default));
	border-left-color: var(--complex-border-left-color-2, var(--complex-border-left-color-default));
	border-right-color: var(--complex-border-right-color-2, var(--complex-border-right-color-default));
	border-top-color: var(--complex-border-top-color-2, var(--complex-border-top-color-default));
	column-rule-color: var(--complex-column-rule-color-2, var(--complex-column-rule-color-default));
	outline-color: var(--complex-outline-color-2, var(--complex-outline-color-default));
	text-decoration-color: var(--complex-text-decoration-color-2, var(--complex-text-decoration-color-default));}`);

additionalStyleSheets[3] = new CSSStyleSheet();
additionalStyleSheets[3].replaceSync(`li {
	accent-color: var(--complex-accent-color-3, var(--complex-accent-color-default));
	border-bottom-color: var(--complex-border-bottom-color-3, var(--complex-border-bottom-color-default));
	border-color: var(--complex-border-color-3, var(--complex-border-color-default));
	border-left-color: var(--complex-border-left-color-3, var(--complex-border-left-color-default));
	border-right-color: var(--complex-border-right-color-3, var(--complex-border-right-color-default));
	border-top-color: var(--complex-border-top-color-3, var(--complex-border-top-color-default));
	column-rule-color: var(--complex-column-rule-color-3, var(--complex-column-rule-color-default));
	outline-color: var(--complex-outline-color-3, var(--complex-outline-color-default));
	text-decoration-color: var(--complex-text-decoration-color-3, var(--complex-text-decoration-color-default));}`);

additionalStyleSheets[4] = new CSSStyleSheet();
additionalStyleSheets[4].replaceSync(`li {
	accent-color: var(--complex-accent-color-4, var(--complex-accent-color-default));
	border-bottom-color: var(--complex-border-bottom-color-4, var(--complex-border-bottom-color-default));
	border-color: var(--complex-border-color-4, var(--complex-border-color-default));
	border-left-color: var(--complex-border-left-color-4, var(--complex-border-left-color-default));
	border-right-color: var(--complex-border-right-color-4, var(--complex-border-right-color-default));
	border-top-color: var(--complex-border-top-color-4, var(--complex-border-top-color-default));
	column-rule-color: var(--complex-column-rule-color-4, var(--complex-column-rule-color-default));
	outline-color: var(--complex-outline-color-4, var(--complex-outline-color-default));
	text-decoration-color: var(--complex-text-decoration-color-4, var(--complex-text-decoration-color-default));}`);;

window.extraCssToAdopt = additionalStyleSheets;
