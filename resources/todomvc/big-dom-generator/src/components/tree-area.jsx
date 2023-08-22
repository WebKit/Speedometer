import { MAX_VISIBLE_TREE_VIEW_ITEM_DEPTH } from "../../params";

import treeHead from "./../tree-generator";
import ChevronRight from "./../assets/Smock_ChevronRight_18_N.svg";
import TaskListIcon from "./../assets/Smock_TaskList_18_N.svg";

const FolderWrapper = (props) => {
    const { treeNode, currentDepth } = props;

    const children = [];
    treeNode.children.forEach((child) => {
        children.push(<TreeItem treeNode={child} currentDepth={currentDepth + 1} />);
    });

    return <ul className="spectrum-TreeView spectrum-TreeView--sizeS">{children}</ul>;
};

const TreeItem = (props) => {
    const { treeNode, currentDepth } = props;

    const children = treeNode.children.length ? <FolderWrapper treeNode={treeNode.children[0]} currentDepth={currentDepth + 1} /> : null;
    const treeViewItemIsOpen = children && currentDepth < MAX_VISIBLE_TREE_VIEW_ITEM_DEPTH ? "is-open" : "";
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
    return (
        <div className="tree-area">
            <h4 className="spectrum-Heading spectrum-Heading--sizeXS">Sprints</h4>
            <FolderWrapper treeNode={treeHead} currentDepth={0} />
        </div>
    );
};
