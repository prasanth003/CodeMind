"use client"

import { Button } from "@/components/ui/button"
import { Github, Mail } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function LoginButtons() {
    const { signInWithGoogle, signInWithGithub } = useAuth()

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={signInWithGoogle}>
                <Mail className="mr-2 h-4 w-4" />
                Google
            </Button>
            <Button variant="outline" size="sm" onClick={signInWithGithub}>
                <Github className="mr-2 h-4 w-4" />
                GitHub
            </Button>
        </div>
    )
}
