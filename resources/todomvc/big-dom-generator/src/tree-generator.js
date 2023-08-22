import { LCG } from "random-seedable";
import { DEFAULT_SEED_FOR_RANDOM_NUMBER_GENERATOR, MAX_GENERATED_DOM_DEPTH, MAX_NUMBER_OF_CHILDREN, PROBABILITY_OF_HAVING_CHILDREN, TARGET_SIZE, MIN_NUMBER_OF_MAX_DEPTH_BRANCHES } from "./../params";

const random = new LCG(DEFAULT_SEED_FOR_RANDOM_NUMBER_GENERATOR);

/**
 * Generated the blueprint of the DOM tree.
 * It generated the minimum number of maximum depth branches first and randomly add
 * children to the nodes in a breadth-first manner.
 * The weight parameters represent how many dom nodes are generated for each type of node.
 */
export const generateTreeHead = (listWeight, openItemWeight, closedItemWeight) => {
    const treeHead = { type: "list", children: [], id: 0 };
    const nodeWeight = { list: listWeight, openItem: openItemWeight, closedItem: closedItemWeight };
    let currentId = 0;

    // Start at -1 one because the head will be counted for each branch
    let totalNodes = -MIN_NUMBER_OF_MAX_DEPTH_BRANCHES + 1;

    for (let i = 0; i < MIN_NUMBER_OF_MAX_DEPTH_BRANCHES; i++) {
        let currentDepth = 0;
        let currentNode = treeHead;
        while (currentDepth < MAX_GENERATED_DOM_DEPTH) {
            let type = (currentDepth + 1) % 2 ? "openItem" : "list";
            currentId++;
            currentNode.children.push({ type: type, children: [], id: currentId });
            currentNode = currentNode.children[currentNode.children.length - 1];
            currentDepth++;
            totalNodes += nodeWeight[type];
        }
        if (MAX_GENERATED_DOM_DEPTH % 2) {
            currentNode.type = "closedItem";
            totalNodes = totalNodes - nodeWeight["openItem"] + nodeWeight["closedItem"];
        }
    }

    const treeNodes = [treeHead];

    // Do an outer loop because there is a chance that the inner loop ends without
    // reaching the target size.
    while (totalNodes < TARGET_SIZE) {
        let index = 0;
        while (index < treeNodes.length && totalNodes < TARGET_SIZE) {
            let currentNode = treeNodes[index];
            switch (currentNode.type) {
                case "openItem":
                    treeNodes.push(currentNode.children[0]);
                    break;
                case "closedItem":
                    if (random.coin(PROBABILITY_OF_HAVING_CHILDREN)) {
                        currentNode.type = "openItem";
                        currentId++;
                        currentNode.children = [{ type: "list", children: [], id: currentId }];
                        totalNodes = totalNodes - nodeWeight["closedItem"] + nodeWeight["openItem"];
                        totalNodes += nodeWeight["list"];
                        treeNodes.push(currentNode.children[0]);
                    }
                    break;
                case "list":
                    if (random.coin(PROBABILITY_OF_HAVING_CHILDREN) || currentNode.children.length) {
                        const numberOfNewChildren = random.randRange(1, MAX_NUMBER_OF_CHILDREN - currentNode.children.length + 1);
                        for (let i = 0; i < numberOfNewChildren && totalNodes < TARGET_SIZE; i++) {
                            currentId++;
                            currentNode.children.push({ type: "closedItem", children: [], id: currentId });
                            totalNodes += nodeWeight["closedItem"];
                        }
                        random.shuffle(currentNode.children, true);
                        treeNodes.push(...currentNode.children);
                    }
                    break;
                default:
                    throw new Error(`Unknown node type: ${currentNode.type}`);
            }
            index++;
        }
    }

    return treeHead;
};
