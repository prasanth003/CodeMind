"use client";

import React from 'react';
import { Globe, ArrowRight, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ApiEndpoint {
    method: string;
    url: string;
    sourceFile: string;
    line: number;
    type: 'client-call' | 'server-route';
}

interface ApiFlowProps {
    data: ApiEndpoint[];
}

export function ApiFlow({ data }: ApiFlowProps) {
    const getMethodColor = (method: string) => {
        switch (method.toUpperCase()) {
            case 'GET': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case 'POST': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case 'PUT': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
            case 'DELETE': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <div className="border rounded-lg bg-card">
            <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    API Flow
                </h3>
            </div>
            <div className="w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">Method</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Endpoint</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Source</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Type</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {data.map((endpoint, i) => (
                            <tr key={i} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                    <Badge variant="secondary" className={getMethodColor(endpoint.method)}>
                                        {endpoint.method}
                                    </Badge>
                                </td>
                                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-mono text-sm">
                                    {endpoint.url}
                                </td>
                                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {endpoint.sourceFile.split('/').pop()}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Line {endpoint.line}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
                                    <Badge variant="outline" className="gap-1">
                                        {endpoint.type === 'client-call' ? (
                                            <>
                                                Client <ArrowRight className="w-3 h-3" /> Server
                                            </>
                                        ) : (
                                            <>
                                                <Server className="w-3 h-3" /> Route
                                            </>
                                        )}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td colSpan={4} className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-center text-muted-foreground h-24">
                                    No API calls or routes detected.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
