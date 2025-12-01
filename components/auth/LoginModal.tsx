"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Shield, Lock, Eye } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface LoginModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSkip?: () => void
}

export function LoginModal({ open, onOpenChange, onSkip }: LoginModalProps) {
    const { signInWithGoogle, skipLogin } = useAuth()

    const handleLogin = async () => {
        try {
            await signInWithGoogle()
            onOpenChange(false)
        } catch (error) {
            console.error("Login failed:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Login Required</DialogTitle>
                    <DialogDescription>
                        Please sign in to analyze your project
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Alert className="border-primary/50 bg-primary/5">
                        <Shield className="h-4 w-4" />
                        <AlertDescription className="ml-2">
                            <strong className="font-semibold">Privacy First</strong>
                            <ul className="mt-2 space-y-1 text-sm">
                                <li className="flex items-start gap-2">
                                    <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>We <strong>do not store</strong> your code or project files</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Eye className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>All analysis happens <strong>locally in your browser</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>Your data remains <strong>100% private</strong></span>
                                </li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <div className="text-sm text-muted-foreground">
                        Authentication is only used to save your analysis preferences and history.
                        Your source code never leaves your device.
                    </div>

                    <Button
                        onClick={handleLogin}
                        className="w-full"
                        size="lg"
                    >
                        <Mail className="mr-2 h-5 w-5" />
                        Continue with Google
                    </Button>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (onSkip) {
                                onSkip()
                            } else {
                                skipLogin()
                            }
                            onOpenChange(false)
                        }}
                        className="w-full"
                    >
                        Skip for now
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
