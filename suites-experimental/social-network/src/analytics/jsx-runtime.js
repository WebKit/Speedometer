// The app's JSX import source: React's runtime, with every element passed through the
// interceptor first.
import { Fragment, jsx as reactJsx, jsxs as reactJsxs } from "react/jsx-runtime";
import { interceptProps, interceptType } from "./interceptor.js";

export { Fragment };

export function jsx(type, props, key) {
    return reactJsx(interceptType(type), interceptProps(type, props), key);
}

export function jsxs(type, props, key) {
    return reactJsxs(interceptType(type), interceptProps(type, props), key);
}

export const jsxDEV = jsx;
