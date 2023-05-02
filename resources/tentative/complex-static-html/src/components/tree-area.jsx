import { LCG } from 'random-seedable';
import { useRef } from 'react';
import ChevronRight from './../assets/Smock_ChevronRight_18_N.svg';

const SEED = 4212021;
const MAX_DEPTH = 80;
const MAX_BREADTH = 16;
const CHILD_PROB = 0.7;
const TARGET_SIZE = 3000;

const FolderWrapper = (props) => {
  const {nodeCount, rando, maxDepth, maxBreadth, childProb, currentDepth} = props;
  if (currentDepth >= maxDepth) {
    return (null);
  }
  const numChildren = rando.randRange(1, maxBreadth);
  const children = [];
  for (let i = 0; i < numChildren && nodeCount.current < TARGET_SIZE; i++) {
    children.push(<TreeItem key={i}
                            nodeCount={nodeCount}
                            rando={rando}
                            numChildren={numChildren}
                            maxBreadth={maxBreadth}
                            maxDepth={maxDepth}
                            childProb={childProb}
                            currentDepth={currentDepth+1}/>);
  }
  nodeCount.current = nodeCount.current + 1;
  return (
    <ul className="ui spectrum-TreeView spectrum-TreeView--sizeM">
      {children}
    </ul>
  );
}

const TreeItem = (props) => {
  const {nodeCount, rando, numChildren, maxDepth, maxBreadth, childProb, currentDepth} = props;
  nodeCount.current = nodeCount.current + 4;
  const children = rando.coin(childProb) ? <FolderWrapper nodeCount={nodeCount}
                                                          rando={rando}
                                                          maxBreadth={maxBreadth}
                                                          maxDepth={maxDepth}
                                                          childProb={childProb}
                                                          currentDepth={currentDepth + 1}/> : null;
  return (
    <li className={`ui spectrum-TreeView-item ${children ? 'is-open' : ''}`}>
      <a className="ui spectrum-TreeView-itemLink">
        <ChevronRight className="ui spectrum-Icon spectrum-UIIcon-ChevronRight100 spectrum-TreeView-itemIndicator"/>
        <span className="ui just-span">Task</span>
      </a>
      {children}
    </li>
  );
}

export const TreeArea = (props) => {
  const nodeCount = useRef(0);
  const rando = new LCG(SEED);
  const maxBreadth = MAX_BREADTH;
  const maxDepth = MAX_DEPTH;
  const childProb = CHILD_PROB;
  return (
    <div className="ui tree-area">
      <FolderWrapper nodeCount={nodeCount}
                     rando = {rando}
                     maxBreadth={maxBreadth}
                     maxDepth={maxDepth}
                     childProb={childProb}
                     currentDepth={0}/>
    </div>
  );
}