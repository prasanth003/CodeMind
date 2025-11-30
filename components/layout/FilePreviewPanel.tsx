"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { X, Copy, FileCode, Check } from "lucide-react"
import { useProject } from "@/contexts/ProjectContext"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState } from "react"

interface FilePreviewPanelProps {
    className?: string
}

export function FilePreviewPanel({
    className
}: FilePreviewPanelProps) {
    const { selectedFile, setSelectedFile } = useProject()
    const [copied, setCopied] = useState(false)

    if (!selectedFile) return null

    const handleCopy = () => {
        if (selectedFile?.content) {
            navigator.clipboard.writeText(selectedFile.content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleClose = () => {
        setSelectedFile(null)
    }

    // Determine language for syntax highlighting
    const getLanguage = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase()
        const languageMap: Record<string, string> = {
            'ts': 'typescript',
            'tsx': 'tsx',
            'js': 'javascript',
            'jsx': 'jsx',
            'json': 'json',
            'css': 'css',
            'scss': 'scss',
            'html': 'html',
            'md': 'markdown',
            'py': 'python',
            'java': 'java',
            'go': 'go',
            'rs': 'rust',
        }
        return languageMap[ext || ''] || 'text'
    }

    return (
        <div className={cn("w-[450px] border-l bg-background flex flex-col h-full shrink-0 transition-all duration-300", className)}>
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-sm truncate">{selectedFile.name}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleCopy}
                        title="Copy to clipboard"
                    >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleClose}
                        title="Close preview"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <ScrollArea className="flex-1 overflow-y-auto">
                <SyntaxHighlighter
                    language={getLanguage(selectedFile.name)}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        fontSize: '0.875rem'
                    }}
                >
                    {selectedFile.content || '// No content available'}
                </SyntaxHighlighter>
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
            </ScrollArea>
        </div>
    )
}
