"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    signOut
} from "firebase/auth"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface AuthContextType {
    user: User | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    signInWithGithub: () => Promise<void>
    logout: () => Promise<void>
    isSkipped: boolean
    skipLogin: (redirect?: boolean) => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSkipped, setIsSkipped] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Check session storage for skipped state
        const skipped = sessionStorage.getItem("isSkipped") === "true"
        if (skipped) {
            setIsSkipped(true)
        }
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)
            if (user) {
                // If user logs in, we might want to reset skip state or associate tracking
                setIsSkipped(false)
            }
        })

        return () => unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        try {
            if ((auth as any).signInWithPopup) {
                alert("Firebase API keys are missing. Please add them to .env.local")
                return
            }
            await signInWithPopup(auth, provider)
            router.push("/dashboard")
        } catch (error) {
            console.error("Error signing in with Google", error)
        }
    }

    const signInWithGithub = async () => {
        const provider = new GithubAuthProvider()
        try {
            if ((auth as any).signInWithPopup) {
                alert("Firebase API keys are missing. Please add them to .env.local")
                return
            }
            await signInWithPopup(auth, provider)
            router.push("/dashboard")
        } catch (error) {
            console.error("Error signing in with Github", error)
        }
    }

    const logout = async () => {
        try {
            await signOut(auth)
            setIsSkipped(false)
            sessionStorage.removeItem("isSkipped")

            // Clear all storage
            localStorage.clear()
            sessionStorage.clear()

            // Clear IndexedDB
            try {
                const { del } = await import('idb-keyval')
                await del('codemind-projects')
                await del('codemind-current-id')
            } catch (e) {
                console.error("Failed to clear IndexedDB", e)
            }

            router.push("/")
            // Force reload to clear any in-memory state
            window.location.reload()
        } catch (error) {
            console.error("Error signing out", error)
        }
    }

    const skipLogin = (redirect = true) => {
        setIsSkipped(true)
        sessionStorage.setItem("isSkipped", "true")
        if (redirect) {
            router.push("/dashboard/overview")
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithGithub, logout, isSkipped, skipLogin }}>
            {children}
        </AuthContext.Provider>
    )
}
