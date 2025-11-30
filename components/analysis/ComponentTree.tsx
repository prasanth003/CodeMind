"use client";

import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    Position,
    MarkerType,
    Panel,
    BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { Badge } from "@/components/ui/badge";
import { FileCode, Box, Layout, ArrowRight, X } from "lucide-react";

interface ComponentNodeData {
    id: string;
    name: string;
    type: 'component' | 'page' | 'layout';
    filePath: string;
    children: string[];
    parentId?: string;
}

interface ComponentTreeProps {
    data: ComponentNodeData[];
}

const nodeWidth = 200;
const nodeHeight = 50;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = direction === 'TB' ? Position.Top : Position.Left;
        node.sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

export function ComponentTree({ data }: ComponentTreeProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Custom Node Details Panel State
    const [details, setDetails] = React.useState<ComponentNodeData | null>(null);

    // Transform data to ReactFlow nodes/edges
    useEffect(() => {
        if (!data || data.length === 0) return;

        const initialNodes: Node[] = data.map((item) => ({
            id: item.id,
            data: { label: item.name, ...item },
            position: { x: 0, y: 0 }, // Calculated by dagre
            type: 'default', // or custom
            className: `border rounded-lg p-2 text-xs font-bold text-center cursor-pointer shadow-sm transition-colors ${item.type === 'page' ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' :
                item.type === 'layout' ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' :
                    'bg-card text-card-foreground border-border hover:bg-accent'
                }`,
            style: {
                width: nodeWidth,
            }
        }));

        const initialEdges: Edge[] = [];
        data.forEach((item) => {
            item.children.forEach((childId) => {
                // Ensure child exists to avoid dangling edges
                if (data.find(d => d.id === childId)) {
                    initialEdges.push({
                        id: `${item.id}-${childId}`,
                        source: item.id,
                        target: childId,
                        type: 'smoothstep',
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                        },
                        animated: true,
                        style: { stroke: '#b1b1b7' }
                    });
                }
            });
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [data, setNodes, setEdges]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setDetails(node.data as ComponentNodeData);
    }, []);

    return (
        <div className="h-full w-full flex relative min-h-[600px] border rounded-lg bg-background overflow-hidden">
            <div className="flex-1 h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    fitView
                    attributionPosition="bottom-right"
                    minZoom={0.1}
                    maxZoom={1.5}
                >
                    <Controls showInteractive={false} className="bg-background border-muted" />
                    <Background gap={20} size={1} color="var(--muted-foreground)" variant={BackgroundVariant.Lines} className="opacity-20" />
                    <Panel position="top-right">
                        <Badge variant="outline" className="bg-background backdrop-blur-sm">
                            {nodes.length} Components
                        </Badge>
                    </Panel>
                </ReactFlow>
            </div>

            {details && (
                <div className="w-80 border-l bg-background p-4 absolute right-0 top-0 bottom-0 shadow-lg overflow-y-auto z-10 animate-in slide-in-from-right">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Details</h3>
                        <button onClick={() => setDetails(null)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Name</label>
                            <div className="flex items-center gap-2 mt-1">
                                {details.type === 'page' ? <Layout className="h-4 w-4 text-blue-500" /> :
                                    details.type === 'layout' ? <Box className="h-4 w-4 text-green-500" /> :
                                        <FileCode className="h-4 w-4 text-orange-500" />}
                                <span className="font-medium">{details.name}</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Type</label>
                            <div className="mt-1">
                                <Badge variant={details.type === 'page' ? 'default' : 'secondary'}>
                                    {details.type}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground">File Path</label>
                            <p className="text-xs mt-1 break-all font-mono bg-muted p-2 rounded">
                                {details.filePath}
                            </p>
                        </div>

                        {details.children.length > 0 && (
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Children ({details.children.length})</label>
                                <ul className="mt-2 space-y-1">
                                    {details.children.map(childId => {
                                        const child = data.find(d => d.id === childId);
                                        return (
                                            <li key={childId} className="text-sm flex items-center gap-2">
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                <span className="truncate">{child?.name || childId}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
