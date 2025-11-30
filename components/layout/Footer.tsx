"use client"

import { Heart } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-center px-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>Developed with</span>
                    <Heart className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
                    <span>by</span>
                    <a
                        href="https://prasanthsekar.info"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:underline transition-colors"
                    >
                        Prasanth Sekar
                    </a>
                    <span className="hidden sm:inline">© {new Date().getFullYear()}</span>
                </p>
            </div>
        </footer>
    )
}
