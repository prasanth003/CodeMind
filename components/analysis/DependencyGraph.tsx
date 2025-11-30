"use client";

import React, { useState, useMemo } from 'react';
import { ArrowRightLeft, FileCode, Search, ArrowRight, Layers, Box } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DependencyNode {
    id: string;
    path: string;
    type: 'file' | 'external';
    dependencies: string[];
}

interface DependencyGraphProps {
    data: DependencyNode[];
}

export function DependencyGraph({ data }: DependencyGraphProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    // Calculate "Core" score and sort
    const sortedData = useMemo(() => {
        // 1. Calculate usage count (in-degree)
        const usageCount = new Map<string, number>();
        data.forEach(node => {
            node.dependencies.forEach(dep => {
                // Resolve dep to id if possible, or just count string occurrences
                // Since dep is a path or id, let's try to match it to a node
                const targetNode = data.find(n => n.id === dep || n.path === dep);
                if (targetNode) {
                    usageCount.set(targetNode.id, (usageCount.get(targetNode.id) || 0) + 1);
                }
            });
        });

        return [...data].sort((a, b) => {
            // Priority 1: "Core" paths (e.g., components/ui, lib, utils)
            const isCoreA = a.path.includes('/components/ui/') || a.path.includes('/lib/') || a.path.includes('/utils/');
            const isCoreB = b.path.includes('/components/ui/') || b.path.includes('/lib/') || b.path.includes('/utils/');

            if (isCoreA && !isCoreB) return -1;
            if (!isCoreA && isCoreB) return 1;

            // Priority 2: Usage count (most used first)
            const countA = usageCount.get(a.id) || 0;
            const countB = usageCount.get(b.id) || 0;
            if (countA !== countB) return countB - countA;

            // Priority 3: Alphabetical
            return a.path.localeCompare(b.path);
        });
    }, [data]);

    const filteredData = sortedData.filter(node =>
        node.path.toLowerCase().includes(search.toLowerCase())
    );

    const selectedNode = selectedId ? data.find(n => n.id === selectedId) : null;

    // Find who uses the selected node
    const usedBy = selectedId ? data.filter(n => n.dependencies.includes(selectedId)) : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px]">
            {/* File List */}
            <div className="border rounded-lg bg-card flex flex-col shadow-sm">
                <div className="p-4 border-b space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Layers className="w-4 h-4 text-primary" />
                            Modules & Dependencies
                        </h3>
                        <Badge variant="outline" className="text-xs">
                            {filteredData.length} Files
                        </Badge>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search modules..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {filteredData.map(node => {
                            const isCore = node.path.includes('/components/ui/') || node.path.includes('/lib/');
                            return (
                                <div
                                    key={node.id}
                                    className={cn(
                                        "p-3 rounded-md cursor-pointer text-sm flex items-center justify-between transition-colors border border-transparent",
                                        selectedId === node.id ? 'bg-primary/10 text-primary border-primary/20' : 'hover:bg-accent hover:text-accent-foreground'
                                    )}
                                    onClick={() => setSelectedId(node.id)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {isCore ? <Box className="w-4 h-4 text-amber-500 shrink-0" /> : <FileCode className="w-4 h-4 text-muted-foreground shrink-0" />}
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="truncate font-medium">{node.path.split('/').pop()}</span>
                                            <span className="truncate text-xs text-muted-foreground opacity-70">{node.path}</span>
                                        </div>
                                    </div>
                                    {node.dependencies.length > 0 && (
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-2 shrink-0">
                                            {node.dependencies.length}
                                        </Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Details Panel */}
            <div className="border rounded-lg bg-card flex flex-col shadow-sm">
                <div className="p-4 border-b bg-muted/30">
                    <h3 className="font-semibold flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4" />
                        Dependency Details
                    </h3>
                </div>

                <ScrollArea className="flex-1 p-4">
                    {selectedNode ? (
                        <div className="space-y-6 animate-in fade-in-50">
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Selected Module</h4>
                                <div className="p-3 bg-accent/50 rounded-lg border text-sm font-mono break-all flex items-start gap-3">
                                    <FileCode className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <div className="font-medium text-foreground">{selectedNode.path.split('/').pop()}</div>
                                        <div className="text-muted-foreground text-xs mt-1">{selectedNode.path}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                        Imports
                                        <Badge variant="secondary" className="text-[10px]">{selectedNode.dependencies.length}</Badge>
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedNode.dependencies.length > 0 ? (
                                            selectedNode.dependencies.map((dep, i) => (
                                                <div key={i} className="p-2 border rounded-md text-sm flex items-center gap-2 bg-background/50">
                                                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                                    <span className={`w-1.5 h-1.5 rounded-full ${dep.startsWith('.') ? 'bg-blue-500' : 'bg-green-500'}`} />
                                                    <span className="truncate font-mono text-xs" title={dep}>{dep}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic pl-2">No imports detected.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                        Used By
                                        <Badge variant="secondary" className="text-[10px]">{usedBy.length}</Badge>
                                    </h4>
                                    <div className="space-y-2">
                                        {usedBy.length > 0 ? (
                                            usedBy.map(node => (
                                                <div
                                                    key={node.id}
                                                    className="p-2 border rounded-md text-sm cursor-pointer hover:bg-accent flex items-center gap-2 group transition-colors"
                                                    onClick={() => setSelectedId(node.id)}
                                                >
                                                    <ArrowRightLeft className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                                                    <span className="font-mono text-xs">{node.path.split('/').pop()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic pl-2">Not imported by any other file.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                            <div className="p-4 rounded-full bg-muted/50">
                                <ArrowRightLeft className="w-8 h-8 opacity-50" />
                            </div>
                            <p className="text-sm">Select a module from the list to view its dependencies.</p>
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
