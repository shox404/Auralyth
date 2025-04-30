import dagre from "dagre";

interface NodeData {
  id: string;
  data: { label: string };
  position: { x: number; y: number };
  type?: string;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

interface LayoutedElements {
  nodes: NodeData[];
  edges: EdgeData[];
}

export const getLayoutedElements = (
  nodes: NodeData[],
  edges: EdgeData[],
  direction: "TB" | "BT" | "LR" | "RL" = "TB"
): LayoutedElements => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  const nodeWidth = 160;
  const nodeHeight = 60;

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes: NodeData[] = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: dagreNode?.x || 0,
        y: dagreNode?.y || 0,
      },
    };
  });

  const layoutedEdges: EdgeData[] = edges.map((edge) => ({
    ...edge,
    sourceHandle: null,
    targetHandle: null,
  }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
};
