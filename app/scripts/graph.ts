type MindmapNode = {
  id: string;
  label: string;
  children?: MindmapNode[];
};

export const parseMermaidGraphToMindmap = (
  mermaidGraph: string
): MindmapNode[] => {

  const nodeMap: Record<string, MindmapNode> = {}; // To hold all nodes by ID
  const parentMap: Record<string, string[]> = {}; // To hold parent-child relationships

  // Split the graph into lines and filter out lines that don't define nodes or edges
  const lines = mermaidGraph
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("graph"));

  // Ensure that a node exists in the map, and create it if not
  const ensureNode = (id: string, label = id) => {
    if (!nodeMap[id]) {
      nodeMap[id] = { id, label, children: [] };
    } else if (label !== id && nodeMap[id].label === id) {
      nodeMap[id].label = label; // Update the label if it's the same node but different label
    }
    return nodeMap[id];
  };

  // Process each line in the Mermaid graph
  lines.forEach((line) => {
    // Match node definitions in the format: A[Label] or A(Label)
    const nodeMatch = line.match(/^(\w+)\s*[\[\(]([^\]\)]+)[\]\)]$/);
    if (nodeMatch) {
      const [, id, label] = nodeMatch;
      ensureNode(id, label); // Ensure the node exists
      return;
    }

    // Match edges in the format: A --> B or A --> B[Label]
    const edgeMatch = line.match(
      /^(\w+)\s*-->\s*(\w+)(?:[\[\(]([^\]\)]+)[\]\)])?;?$/ // An edge with an optional label
    );
    if (edgeMatch) {
      const [, sourceId, targetId, targetLabel] = edgeMatch;
      ensureNode(sourceId); // Ensure the source node exists
      ensureNode(targetId, targetLabel); // Ensure the target node exists, set label if provided
      parentMap[sourceId] = parentMap[sourceId] || [];
      parentMap[sourceId].push(targetId); // Store the relationship between parent and child
    }
  });

  // Now assign children to nodes based on the parent-child relationships
  Object.entries(parentMap).forEach(([sourceId, children]) => {
    nodeMap[sourceId].children = children.map((id) => nodeMap[id]);
  });

  // Find all root nodes (nodes that are not children of any other node)
  const allChildren = new Set(Object.values(parentMap).flat());
  return Object.values(nodeMap).filter((node) => !allChildren.has(node.id));
};
