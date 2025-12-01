"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import { useState } from "react"
import { LoginModal } from "@/components/auth/LoginModal"

interface AuthGuardProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
    const { user } = useAuth()
    const [showLoginModal, setShowLoginModal] = useState(false)

    if (user) {
        return <>{children}</>
    }

    if (fallback) {
        return <>{fallback}</>
    }

    return (
        <div className="relative w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/5">
            <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-0" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-md">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Lock className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Login Required</h3>
                    <p className="text-sm text-muted-foreground">
                        This feature requires an account. Please log in to access AI analysis and other advanced features.
                    </p>
                </div>
                <Button onClick={() => setShowLoginModal(true)}>
                    Log in to Access
                </Button>
            </div>
        </div>
    )
}
