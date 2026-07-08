import { params } from "./params.mjs";

export const defaultNumberOfItemsToAdd = 100;
export let numberOfItemsToAdd = defaultNumberOfItemsToAdd;

export function getNumberOfItemsToAdd() {
    return numberOfItemsToAdd;
}

export function handleComplexityChange() {
    numberOfItemsToAdd = Math.round(defaultNumberOfItemsToAdd * params.complexity);
}
