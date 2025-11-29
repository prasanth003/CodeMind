"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { FilePreviewPanel } from "@/components/layout/FilePreviewPanel"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/")
        }
    }, [user, loading, router])

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    if (!user) {
        return null
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar className="hidden md:block" />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <div className="flex flex-1 overflow-hidden">
                    <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
                        {children}
                    </main>
                    <FilePreviewPanel className="hidden xl:flex" />
                </div>
            </div>
        </div>
    )
}
