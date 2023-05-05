import { LCG } from "random-seedable";
import { useRef } from "react";
import { SEED, MAX_DEPTH, MAX_BREADTH, CHILD_PROB, TARGET_SIZE } from "./../params";
import ChevronRight from "./../assets/Smock_ChevronRight_18_N.svg";

const FolderWrapper = (props) => {
    const { nodeCount, random, maxDepth, maxBreadth, childProb, currentDepth } = props;
    if (currentDepth >= maxDepth) {
        return null;
    }
    // Choose a random number of children.
    const numChildren = random.randRange(1, maxBreadth);
    const children = [];
    for (let i = 0; i < numChildren && nodeCount.current < TARGET_SIZE; i++) {
        children.push(<TreeItem key={i} nodeCount={nodeCount} random={random} numChildren={numChildren} maxBreadth={maxBreadth} maxDepth={maxDepth} childProb={childProb} currentDepth={currentDepth + 1} />);
    }
    nodeCount.current = nodeCount.current + 1;
    return <ul className="ui spectrum-TreeView spectrum-TreeView--sizeM">{children}</ul>;
};

const TreeItem = (props) => {
    const { nodeCount, random, numChildren, maxDepth, maxBreadth, childProb, currentDepth } = props;
    nodeCount.current = nodeCount.current + 4;
    // Choose whether to have children.
    const children = random.coin(childProb) ? <FolderWrapper nodeCount={nodeCount} random={random} maxBreadth={maxBreadth} maxDepth={maxDepth} childProb={childProb} currentDepth={currentDepth + 1} /> : null;
    return (
        <li className={`ui spectrum-TreeView-item ${children ? "is-open" : ""}`}>
            <a className="ui spectrum-TreeView-itemLink">
                <ChevronRight className="ui spectrum-Icon spectrum-UIIcon-ChevronRight100 spectrum-TreeView-itemIndicator" />
                <span className="ui just-span">{children ? "Sprint" : "Todo List"}</span>
            </a>
            {children}
        </li>
    );
};

export const TreeArea = (props) => {
    const nodeCount = useRef(0);
    const random = new LCG(SEED);
    const maxBreadth = MAX_BREADTH;
    const maxDepth = MAX_DEPTH;
    const childProb = CHILD_PROB;
    return (
        <div className="ui tree-area">
            <FolderWrapper nodeCount={nodeCount} random={random} maxBreadth={maxBreadth} maxDepth={maxDepth} childProb={childProb} currentDepth={0} />
        </div>
    );
};
