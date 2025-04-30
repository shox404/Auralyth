// type MindmapNode = {
//     id: string;
//     label: string;
//     children?: MindmapNode[];
//   };

//   export const getDiagramData = (
//     tree: MindmapNode[]
//   ): { nodes: any[]; edges: any[] } => {
//     const flatNodes: { id: string; label: string }[] = [];

//     const collectNodes = (node: MindmapNode) => {
//       flatNodes.push({ id: node.id, label: node.label });
//       node.children?.forEach(collectNodes);
//     };

//     tree.forEach(collectNodes);

//     const nodes = flatNodes.map((item, index) => ({
//       id: `node-${index}`,
//       data: { label: item.label },
//       position: {
//         x: Math.random() * 400,
//         y: index * 100,
//       },
//     }));

//     const edges = nodes.slice(0, -1).map((_, index) => ({
//       id: `edge-${index}`,
//       source: `node-${index}`,
//       target: `node-${index + 1}`,
//     }));

//     return { nodes, edges };
//   };
// type MindmapNode = {
//     id: string;
//     label: string;
//     children?: MindmapNode[];
//   };

//   export const getDiagramData = (
//     tree: MindmapNode[]
//   ): { nodes: any[]; edges: any[] } => {
//     const flatNodes: { id: string; label: string }[] = [];

//     const collectNodes = (node: MindmapNode) => {
//       flatNodes.push({ id: node.id, label: node.label });
//       node.children?.forEach(collectNodes);
//     };

//     tree.forEach(collectNodes);

//     const nodes = flatNodes.map((item, index) => ({
//       id: `node-${index}`,
//       data: { label: item.label },
//       position: {
//         x: Math.random() * 400,
//         y: index * 100,
//       },
//     }));

//     const edges = nodes.slice(0, -1).map((_, index) => ({
//       id: `edge-${index}`,
//       source: `node-${index}`,
//       target: `node-${index + 1}`,
//     }));

//     return { nodes, edges };
//   };
import { Node, Edge } from "reactflow";

export function parseMermaidToReactFlow(mermaidString: string): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodeMap = new Map<string, string>();
  const nodeOrder: string[] = [];
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const lines = mermaidString
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("graph"));

  for (const line of lines) {
    const edgeWithLabels = line.match(
      /^(\w+)\[(.+?)\]\s*-->\s*(\w+)\[(.+?)\]$/
    );
    if (edgeWithLabels) {
      const [, sourceId, sourceLabel, targetId, targetLabel] = edgeWithLabels;

      if (!nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, sourceLabel);
        nodeOrder.push(sourceId);
      }
      if (!nodeMap.has(targetId)) {
        nodeMap.set(targetId, targetLabel);
        nodeOrder.push(targetId);
      }

      edges.push({
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: "smoothstep",
      });

      continue;
    }

    const edgeNoLabels = line.match(/^(\w+)\s*-->\s*(\w+)$/);
    if (edgeNoLabels) {
      const [, sourceId, targetId] = edgeNoLabels;

      if (!nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, sourceId);
        nodeOrder.push(sourceId);
      }
      if (!nodeMap.has(targetId)) {
        nodeMap.set(targetId, targetId);
        nodeOrder.push(targetId);
      }

      edges.push({
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
      });

      continue;
    }

    const nodeMatch = line.match(/^(\w+)\[(.+?)\]$/);
    if (nodeMatch) {
      const [, nodeId, label] = nodeMatch;

      if (!nodeMap.has(nodeId)) {
        nodeMap.set(nodeId, label);
        nodeOrder.push(nodeId);
      }

      continue;
    }

    const standalone = line.match(/^(\w+)$/);
    if (standalone) {
      const [nodeId] = standalone;

      if (!nodeMap.has(nodeId)) {
        nodeMap.set(nodeId, nodeId);
        nodeOrder.push(nodeId);
      }

      continue;
    }

    console.warn("Unrecognized line:", line);
  }

  // Calculate node levels for tree layout
  const getLevels = (edges: Edge[]): Map<string, number> => {
    const levels = new Map<string, number>();
    const visited = new Set<string>();

    const dfs = (node: string, depth: number) => {
      if (visited.has(node)) return;
      visited.add(node);
      levels.set(node, Math.max(levels.get(node) ?? 0, depth));
      for (const edge of edges.filter((e) => e.source === node)) {
        dfs(edge.target, depth + 1);
      }
    };

    const allTargets = new Set(edges.map((e) => e.target));
    const roots = [...new Set(edges.map((e) => e.source))].filter(
      (n) => !allTargets.has(n)
    );

    for (const root of roots) dfs(root, 0);
    return levels;
  };

  const levels = getLevels(edges);
  const levelMap: Record<number, string[]> = {};

  for (const id of nodeOrder) {
    const level = levels.get(id) ?? 0;
    if (!levelMap[level]) levelMap[level] = [];
    levelMap[level].push(id);
  }

  // Layout constants
  const xGap = 280;
  const yGap = 160;

  // Compute positions
  const nodePositions: Record<string, { x: number; y: number }> = {};
  let maxX = -Infinity,
    maxY = -Infinity,
    minX = Infinity,
    minY = Infinity;

  Object.entries(levelMap).forEach(([levelStr, ids], row) => {
    const level = parseInt(levelStr);
    const totalWidth = (ids.length - 1) * xGap;
    const startX = -totalWidth / 2;

    ids.forEach((id, col) => {
      const x = startX + col * xGap;
      const y = level * yGap;
      nodePositions[id] = { x, y };
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
    });
  });

  // Center the graph (e.g., for 800x600 view)
  const centerOffsetX = 400 - (minX + (maxX - minX) / 2);
  const centerOffsetY = 300 - (minY + (maxY - minY) / 2);

  for (const id of nodeOrder) {
    const pos = nodePositions[id];
    nodes.push({
      id,
      data: { label: nodeMap.get(id)! },
      position: {
        x: pos.x + centerOffsetX,
        y: pos.y + centerOffsetY,
      },
      type: "bezier",
    });
  }

  return { nodes, edges };
}
