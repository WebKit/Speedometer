import { LCG } from 'random-seedable';

const SEED = 4212021;
const rando = new LCG(SEED);
const MAX_SELECTOR_LEN = 7;

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

const chooseCombinator = (depth, index) => {
  const selectors = [' ', ' > '];
  if (index > 0 && depth !== 7) {
    selectors.push(' + ');
    selectors.push(' ~ ');
  }
  return rando.choice(selectors);
}

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

const buildMatchingSelector = (depth, index, oldCombinator, selLen, maxLen) => {
  if (selLen >= maxLen) {
    return '';
  }
  const getSelector = randomWeighted([getClassname, getType, ()=>'*'], [0.6,0.3,0.1]);
  const selector = getSelector(depth, index);
  const combinator = chooseCombinator(depth, index);
  if (depth === 0) {
    return `${selector}${oldCombinator}`
  }
  const nextDepth = getNextDepth(combinator, depth);
  const nextIndex =  getNextIndex(combinator, nextDepth, index);
  return buildMatchingSelector(nextDepth, nextIndex, combinator, selLen+1, maxLen) + selector + oldCombinator;
}

const buildNonMatchingSelector = (depth, index, oldCombinator, selLen, badSelector) => {
  if (depth === 0) {
    return '.fake-classname' + oldCombinator;
  }
  const lastSel = selLen === badSelector;
  let maybeDepth = lastSel ? depth+1 : depth;
  const getSelector = randomWeighted([getClassname, getType, ()=>'*'], [0.6,0.3,0.1]);
  const selector = getSelector(maybeDepth, index);
  if (lastSel) {
    return `${selector}.fake-classname${oldCombinator}`;
  }
  const combinator = chooseCombinator(maybeDepth, index);
  const nextDepth = getNextDepth(combinator, maybeDepth);
  const nextIndex =  getNextIndex(combinator, nextDepth, index);
  return buildNonMatchingSelector(nextDepth, nextIndex, combinator, selLen+1, badSelector) + selector + oldCombinator;
}

export const genCss = () => {
  const matchingSelectors = [];
  const nonMatchingSelectors = [];
  for (let index = 0; index<100; index++){
    matchingSelectors.push(buildMatchingSelector(6, index, '', 0, rando.randRange(3,MAX_SELECTOR_LEN)));
    matchingSelectors.push(buildMatchingSelector(7, index, '', 0, rando.randRange(3,MAX_SELECTOR_LEN)));
    nonMatchingSelectors.push(buildNonMatchingSelector(6, index, '', 0, rando.randRange(3,MAX_SELECTOR_LEN)));
    nonMatchingSelectors.push(buildNonMatchingSelector(7, index, '', 0, rando.randRange(3,MAX_SELECTOR_LEN)));
  }
  const matchingCssRules = [];
  matchingSelectors.forEach((selector,i) => {
    matchingCssRules.push(`${selector} { background-color: rgba(0,0,0,${i/1000}) }`);
  });
  const nonMatchingCssRules = [];
  nonMatchingSelectors.forEach((selector,i) => {
    nonMatchingCssRules.push(`${selector} { background-color: rgba(0,0,0,${i/1000}) }`);
  });
  return {matchingCss:matchingCssRules.join('\n'), nonMatchingCss:nonMatchingCssRules.join('\n')};
}