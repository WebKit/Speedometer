import { LCG } from 'random-seedable';
import { SEED, MAX_SELECTOR_LEN } from './params.js';

const rando = new LCG(SEED);

// The generator assumes the page has the following structure,
// and it needs to be updated if the structure changes.
// TODO: make it less hard-coded.
/* 
  <body class="ui">
    <div class="ui main-ui">
      <div class="ui show-more">
      <div class="ui top-bar">
      <div class="ui ribbon">
      <div class="ui tree-area">
      <div class="ui todo-area">
        <div class="absolutely-positioned-element">
          <section class="todoapp">
            <header class="header">
            <main class="main">
              <input class="toggle-all-container">
              <ul class="todo-list">
                <li class="li-0-0">
                  <div class="view-0">
                <li class="li-1-0">
                  <div class="view-0">
                ...
              </ul>
            </main>
          </section>
        </div>
      </div>
    </div>
</body>
*/

// Returns a classname for the element at depth `depth` and in position `index`.
const getClassname = (depth, index) => {
  switch (depth) {
    case 7:
      return `.view-${index}`;
    case 6:
      return `.li-${index}-0`;
    case 5:
      if (index === 0) {
        return '.toggle-all-container';
      }
      return '.todo-list';
    case 4:
      if (index === 0) {
        return '.header';
      }
      return '.main';
    case 3:
      return '.todoapp';
    case 2:
      return '.absolutely-positioned-element';
    case 1:
      switch (index) {
        case 0:
          return '.show-more';
        case 1:
          return '.ribbon';
        case 2:
          return '.top-bar';
        case 3:
          return '.tree-area';
        case 4:
          return '.todo-area';
      }
    case 0:
      return '.main-ui';
  }
}

// Returns the type for the element at depth `depth` and in position `index`.
const getType = (depth, index) => {
  switch (depth) {
    case 7:
      return `div`;
    case 6:
      return `li`;
    case 5:
      if (index === 0) {
        return 'div';
      }
      return 'ul';
    case 4:
      if (index === 0) {
        return 'header';
      }
      return 'main';
    case 3:
      return 'section';
    case 2:
    case 1:
      return 'div';
    case 0:
      return '.main-ui';
  }
}

// Returns the next depth depending on the combinator.
const getNextDepth = (combinator, depth) => {
  switch (combinator) {
    case ' ':
      return rando.randRange(0,depth);
    case ' > ':
      return depth-1;
    case ' + ':
    case ' ~ ':
      return depth;
  }
}

// Returns the next index depending on the combinator.
const getNextIndex = (combinator, newDepth, index) => {
  if (combinator === ' + ') {
    return index-1;
  }
  if (combinator === ' ~ ') {
    return rando.randRange(0,index);
  }
  switch (newDepth) {
    case 6:
      return index;
    case 5:
    case 4:
      return 1;
    case 1:
      return 4;
    default:
      return 0;
  }
}

// Returns a random combinator depending on the depth and index.
// The combinator is chosen so that the generated selector is valid.
const chooseCombinator = (depth, index) => {
  const selectors = [' ', ' > '];
  if (index > 0 && depth !== 7) {
    selectors.push(' + ');
    selectors.push(' ~ ');
  }
  return rando.choice(selectors);
}

// Returns a random element from `options` with probability `probs`.
const randomWeighted = (options, probs) => {
  const randNum = rando.float();
  let accumProb = 0;
  for (let i = 0; i< probs.length; i++) {
    accumProb += probs[i];
    if (randNum <= accumProb) {
      return options[i];
    }
  }
  return options[options.length-1];
}

// Returns a matching selector for the element at depth `depth` and in position `index`.
const buildMatchingSelector = (depth, index, oldCombinator, selLen, maxLen) => {
  // Stop if we've reached the target length.
  if (selLen >= maxLen) {
    return '';
  }

  // Choose a selector.
  const getSelector = randomWeighted([getClassname, getType, ()=>'*'], [0.6,0.3,0.1]);
  const selector = getSelector(depth, index);
  const combinator = chooseCombinator(depth, index);

  // If we're at depth 0, we're done.
  if (depth === 0) {
    return `${selector}${oldCombinator}`
  }

  // Otherwise, recurse.
  const nextDepth = getNextDepth(combinator, depth);
  const nextIndex =  getNextIndex(combinator, nextDepth, index);
  return buildMatchingSelector(nextDepth, nextIndex, combinator, selLen+1, maxLen) + selector + oldCombinator;
}

// Returns a non-matching selector for the element at depth `depth` and in position `index`.
// We kept the selector from matching by adding the `.just-span` class to the left-most selector.
// TODO: Is there a better way to ensure the selector is non-matching?
const buildNonMatchingSelector = (depth, index, oldCombinator, selLen, badSelector) => {
  // If we are in the top node, we are done.
  if (depth === 0) {
    return '.just-span' + oldCombinator;
  }

  // If we've reached the target length, pick a random classname from its children.
  const getSelector = randomWeighted([getClassname, getType, ()=>'*'], [0.6,0.3,0.1]);
  const selector = getSelector(depth, index);
  if (selLen === badSelector) {
    const wrongDepth = rando.randRange(Math.min(depth+1, 7), 8);
    const wrongSelector = getClassname(wrongDepth, 0);
    return selector + wrongSelector + oldCombinator;
  }

  // Otherwise, recurse.
  const combinator = chooseCombinator(depth, index);
  const nextDepth = getNextDepth(combinator, depth);
  const nextIndex =  getNextIndex(combinator, nextDepth, index);
  return buildNonMatchingSelector(nextDepth, nextIndex, combinator, selLen+1, badSelector) + selector + oldCombinator;
}

// Returns a random 200 matching selectors and 200 non-matching selectors targeted at the todoMVC items.
export const genCss = () => {
  const matchingSelectors = [];
  const nonMatchingSelectors = [];
  for (let index = 0; index<100; index++){
    // Add `:not(.ui)` to the matching selectors to avoid matching the UI elements.
    matchingSelectors.push(buildMatchingSelector(6, index, '', 0, rando.randRange(3,MAX_SELECTOR_LEN))+':not(.ui)');
    matchingSelectors.push(buildMatchingSelector(7, index, '', 0, rando.randRange(3,MAX_SELECTOR_LEN))+':not(.ui)');
    nonMatchingSelectors.push(buildNonMatchingSelector(6, index, '', 0, rando.randRange(3,MAX_SELECTOR_LEN)));
    nonMatchingSelectors.push(buildNonMatchingSelector(7, index, '', 0, rando.randRange(3,MAX_SELECTOR_LEN)));
  }
  // Create random color styles. Same color, different opacity.
  // TODO: Choose a better color for the todoMVC theme.
  const matchingCssRules = [];
  matchingSelectors.forEach((selector,i) => {
    matchingCssRules.push(`${selector} { background-color: rgba(140,140,140,${i/1000}) }`);
  });
  const nonMatchingCssRules = [];
  nonMatchingSelectors.forEach((selector,i) => {
    nonMatchingCssRules.push(`${selector} { background-color: rgba(140,140,140,${i/1000}) }`);
  });
  return {matchingCss:matchingCssRules.join('\n'), nonMatchingCss:nonMatchingCssRules.join('\n')};
}