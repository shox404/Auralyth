"use client";

import type React from "react";
import { useState } from "react";
import ReactFlow, { Background, Controls, Panel } from "reactflow";
import "reactflow/dist/style.css";

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
}

export default function MindmapPage() {
  const [prompt, setPrompt] = useState("create mindmap to learn python");
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [loading, setLoading] = useState(false);

  const generateMindmap = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mindmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("Failed to generate mindmap");

      const { nodes, edges } = await res.json();
      setNodes(nodes);
      setEdges(edges);
    } catch (error) {
      console.error("Error generating mindmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (event: React.MouseEvent, node: any) => {
    try {
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(node.data),
      });

      if (!res.ok) throw new Error("Failed to process node");

      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("Error processing node:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Interactive Mindmap Generator
        </h1>
        <p className="text-gray-600 mb-6">
          Enter a topic or concept to generate a visual mindmap
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter your ideas, topics, or plan here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={generateMindmap}
          disabled={loading}
          className="w-full sm:w-auto whitespace-nowrap px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
              Generate Mindmap
            </span>
          )}
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="h-[600px] w-full">
          {nodes.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodeClick={handleNodeClick}
              fitView
              className="bg-white"
              nodesDraggable={true}
            >
              <Controls className="bg-white border rounded-md shadow-sm" />
              <Background color="#ccc" gap={16} />
              <Panel
                position="top-right"
                className="bg-white/80 p-2 rounded-md shadow-sm backdrop-blur-sm"
              >
                <p className="text-xs text-gray-600">
                  Click on any node for more details
                </p>
              </Panel>
            </ReactFlow>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-50">
              {loading ? (
                <div className="flex flex-col items-center">
                  <svg
                    className="animate-spin h-8 w-8 text-purple-600 mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-gray-600">Generating your mindmap...</p>
                </div>
              ) : (
                <div className="text-center max-w-md px-4">
                  <h3 className="font-medium text-lg mb-2">
                    Your mindmap will appear here
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Enter a topic or concept and click "Generate Mindmap" to
                    visualize your ideas
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          Tip: You can drag nodes to rearrange your mindmap and zoom in/out
          using the controls or mouse wheel.
        </p>
      </div>
    </div>
  );
}
