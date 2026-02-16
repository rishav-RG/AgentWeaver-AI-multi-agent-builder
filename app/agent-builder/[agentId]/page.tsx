"use client";
import React, { useContext, useEffect } from "react";
import Header from "../_components/Header";
import { useState, useCallback } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  MiniMap,
  Controls,
  Panel,
  useOnSelectionChange,
  OnSelectionChangeParams,
  Node,
  Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import StartNode from "../_customNodes/StartNode";
import AgentNode from "../_customNodes/AgentNode";
import AgentToolsPanel from "../_components/AgentToolsPanel";
import { WorkflowContext } from "@/context/WorkflowContext";
import { useConvex, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Agent } from "@/types/AgentTypes";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EndNode from "../_customNodes/EndNode";
import IfElseNode from "../_customNodes/IfElseNode";
import WhileNode from "../_customNodes/WhileNode";
import UserApprovalNode from "../_customNodes/UserApprovalNode";
import ApiNode from "../_customNodes/ApiNode";
import SettingPanel from "../_components/SettingPanel";

// const initialNodes = [
//   { id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" }, type: 'StartNode' },
//   { id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" }, type: 'AgentNode' },
// ];
// const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

export const nodeTypes = {
  StartNode: StartNode,
  AgentNode: AgentNode,
  EndNode: EndNode,
  IfElseNode: IfElseNode,
  WhileNode: WhileNode,
  UserApprovalNode: UserApprovalNode,
  ApiNode: ApiNode,
};

export default function AgentBuilder() {
  const {
    addedNodes,
    setAddedNodes,
    nodeEdges,
    setNodeEdges,
    setSelectedNode,
  } = useContext(WorkflowContext);

  const { agentId } = useParams();

  const convex = useConvex();

  const updateAgentDetail = useMutation(api.agent.UpdateAgentDetail);

  const [agentDetail, setAgentDetail] = useState<Agent>();
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

  const GetAgentDetail = async () => {
    const results = await convex.query(api.agent.GetAgentById, {
      agentId: agentId as string,
    });
    setAgentDetail(results);
  };

  useEffect(() => {
    GetAgentDetail();
  }, []);

  useEffect(() => {
    if (agentDetail) {
      // Ensure nodes and edges are always arrays, even if undefined/null from database
      setAddedNodes(
        agentDetail.nodes || [
          {
            id: "start",
            position: { x: 0, y: 0 },
            data: { label: "Start" },
            type: "StartNode",
          },
        ],
      );
      setNodeEdges(agentDetail.edges || []);
    }
  }, [agentDetail]);

  const SaveNodeAndEdges = async (updatedNodes?: any, updatedEdges?: any) => {
    const result = await updateAgentDetail({
      id: agentDetail?._id as any,
      edges: updatedEdges ?? nodeEdges,
      nodes: updatedNodes ?? addedNodes,
    });
    toast.success("Saved!");
  };

  const onNodesChange = useCallback(
    (changes: any) =>
      setAddedNodes((nodesSnapshot: any) => {
        // Ensure nodesSnapshot is an array before applying changes
        if (!Array.isArray(nodesSnapshot)) {
          return [
            {
              id: "start",
              position: { x: 0, y: 0 },
              data: { label: "Start" },
              type: "StartNode",
            },
          ];
        }
        const updated = applyNodeChanges(changes, nodesSnapshot);
        return updated;
      }),
    [setAddedNodes],
  );
  const onEdgesChange = useCallback(
    (changes: any) =>
      setNodeEdges((edgesSnapshot: any) => {
        // Ensure edgesSnapshot is an array before applying changes
        if (!Array.isArray(edgesSnapshot)) {
          return [];
        }
        return applyEdgeChanges(changes, edgesSnapshot);
      }),
    [setNodeEdges],
  );
  const onConnect = useCallback(
    (params: any) =>
      setNodeEdges((edgesSnapshot: any) => {
        // Ensure edgesSnapshot is an array before adding edge
        if (!Array.isArray(edgesSnapshot)) {
          return [params];
        }
        return addEdge(params, edgesSnapshot);
      }),
    [setNodeEdges],
  );

  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0) {
      toast.info("No nodes selected to delete");
      return;
    }

    // Check if trying to delete the start node
    const hasStartNode = selectedNodes.some(
      (node: Node) => node.id === "start" || node.type === "StartNode",
    );
    if (hasStartNode) {
      toast.error("Cannot delete the Start node");
      return;
    }

    const selectedNodeIds = selectedNodes.map((node) => node.id);

    // Remove selected nodes
    const updatedNodes = addedNodes.filter(
      (node: Node) => !selectedNodeIds.includes(node.id),
    );

    // Remove edges connected to deleted nodes
    const updatedEdges = nodeEdges.filter(
      (edge: Edge) =>
        !selectedNodeIds.includes(edge.source) &&
        !selectedNodeIds.includes(edge.target),
    );

    setAddedNodes(updatedNodes);
    setNodeEdges(updatedEdges);
    setSelectedNodes([]);
    setSelectedNode(null);

    // Auto-save after deletion
    SaveNodeAndEdges(updatedNodes, updatedEdges);
    toast.success(`Deleted ${selectedNodes.length} node(s)`);
  }, [selectedNodes, addedNodes, nodeEdges]);

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedNodes.length > 0
      ) {
        // Prevent default backspace behavior (going back in browser history)
        const target = event.target as HTMLElement;
        // Only trigger delete if not typing in an input/textarea
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          event.preventDefault();
          deleteSelectedNodes();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedNodes, selectedNodes]);

  const onNodeSelect = useCallback(
    ({ nodes, edges }: OnSelectionChangeParams) => {
      setSelectedNode(nodes[0]);
      setSelectedNodes(nodes);
    },
    [],
  );

  useOnSelectionChange({
    onChange: onNodeSelect,
  });
  return (
    <div>
      <Header agentDetail={agentDetail} />
      <div style={{ width: "100vw", height: "90vh" }}>
        <ReactFlow
          nodes={addedNodes}
          edges={nodeEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(e, node) => setSelectedNode(node)}
          nodeTypes={nodeTypes}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Panel position="top-left">
            <AgentToolsPanel />
          </Panel>

          <Panel position="top-right">
            <SettingPanel onSave={(nodes: any) => SaveNodeAndEdges(nodes)} />
          </Panel>
          <Panel position="bottom-center">
            <div className="flex gap-2">
              <Button
                onClick={deleteSelectedNodes}
                variant="destructive"
                disabled={selectedNodes.length === 0}
                title="Delete selected nodes (Delete/Backspace)"
              >
                <Trash2 className="mr-2" /> Delete ({selectedNodes.length})
              </Button>
              <Button onClick={() => SaveNodeAndEdges()}>
                <Save /> Save
              </Button>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
