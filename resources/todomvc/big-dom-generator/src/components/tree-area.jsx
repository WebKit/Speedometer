import { LCG } from "random-seedable";
import { useRef } from "react";
import { DEFAULT_SEED_FOR_RANDOM_NUMBER_GENERATOR, MAX_GENERATED_DOM_DEPTH, MAX_NUMBER_OF_CHILDREN, PROBABILITY_OF_HAVING_CHILDREN, TARGET_SIZE, MAX_VISIBLE_TREE_VIEW_ITEM_DEPTH } from "../../params";

import ChevronRight from "./../assets/Smock_ChevronRight_18_N.svg";
import TaskListIcon from "./../assets/Smock_TaskList_18_N.svg";

const FolderWrapper = (props) => {
    const { nodeCount, random, maxDepth, maxNumChildren, childProbability, currentDepth } = props;
    // prettier-ignore
    if (currentDepth >= maxDepth || nodeCount.current >= TARGET_SIZE)
        return null;

    nodeCount.current = nodeCount.current + 1;
    // Choose a random number of children.
    const numChildren = random.randRange(1, maxNumChildren);
    const children = [];
    for (let i = 0; i < numChildren && nodeCount.current < TARGET_SIZE; i++)
        children.push(<TreeItem key={i} nodeCount={nodeCount} random={random} numChildren={numChildren} maxNumChildren={maxNumChildren} maxDepth={maxDepth} childProbability={childProbability} currentDepth={currentDepth + 1} />);

    return <ul className="spectrum-TreeView spectrum-TreeView--sizeS">{children}</ul>;
};

const TreeItem = (props) => {
    const { nodeCount, random, maxDepth, maxNumChildren, childProbability, currentDepth } = props;

    if (currentDepth >= maxDepth || nodeCount.current >= TARGET_SIZE)
        return null;
    const children = random.coin(childProbability) ? <FolderWrapper nodeCount={nodeCount} random={random} maxNumChildren={maxNumChildren} maxDepth={maxDepth} childProbability={childProbability} currentDepth={currentDepth + 1} /> : null;
    const treeViewItemIsOpen = children && currentDepth < MAX_VISIBLE_TREE_VIEW_ITEM_DEPTH ? "is-open" : "";
    if (children)
        nodeCount.current = nodeCount.current + 5;
    else 
        nodeCount.current = nodeCount.current + 10;
    console.log(nodeCount.current);
    return (
        <li className={`spectrum-TreeView-item ${treeViewItemIsOpen}`}>
            <a className="spectrum-TreeView-itemLink">
                {children
                    ? <ChevronRight className="spectrum-Icon spectrum-TreeView-itemIndicator spectrum-TreeView-itemIcon" />
                    : <TaskListIcon className="task-list-icon spectrum-Icon spectrum-TreeView-itemIndicator spectrum-TreeView-itemIcon spectrum-Icon--sizeM" />
                }

                <span className="just-span spectrum-TreeView-itemLabel">{children ? "Sprint" : "Todo List"}</span>
            </a>
            {children}
        </li>
    );
};

export const TreeArea = () => {
    const nodeCount = useRef(0);
    const random = new LCG(DEFAULT_SEED_FOR_RANDOM_NUMBER_GENERATOR);
    const maxNumChildren = MAX_NUMBER_OF_CHILDREN;
    const maxDepth = MAX_GENERATED_DOM_DEPTH;
    const childProbability = PROBABILITY_OF_HAVING_CHILDREN;
    return (
        <div className="tree-area">
            <h4 className="spectrum-Heading spectrum-Heading--sizeXS">Sprints</h4>
            <FolderWrapper nodeCount={nodeCount} random={random} maxNumChildren={maxNumChildren} maxDepth={maxDepth} childProbability={childProbability} currentDepth={0} />
        </div>
    );
};
