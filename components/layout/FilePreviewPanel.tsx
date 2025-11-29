"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Copy, FileCode } from "lucide-react"

interface FilePreviewPanelProps {
    isOpen?: boolean
    onClose?: () => void
    fileName?: string
    content?: string
    className?: string
}

import { cn } from "@/lib/utils"

export function FilePreviewPanel({
    isOpen = true,
    onClose,
    fileName = "example.tsx",
    content = "// Select a file to view its content",
    className
}: FilePreviewPanelProps) {
    if (!isOpen) return null

    return (
        <div className={cn("w-80 border-l bg-background flex flex-col h-full shrink-0 transition-all duration-300", className)}>
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm truncate max-w-[150px]">{fileName}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <ScrollArea className="flex-1 p-4">
                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                    {content}
                </pre>
            </ScrollArea>
        </div>
    )
}
