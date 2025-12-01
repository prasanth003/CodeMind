"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, Heart, ExternalLink, Github, Briefcase, MapPin } from "lucide-react"

export default function SettingsPage() {
    const { user } = useAuth()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Your public profile information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user ? (
                            <>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "@user"} />
                                        <AvatarFallback className="text-lg">{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user?.displayName || "User"}</p>
                                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input id="name" value={user?.displayName || ""} disabled />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={user?.email || ""} disabled />
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <p>You have not logged in.</p>
                                <p className="text-sm mt-2">Log in to see your profile information.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>
                            Customize the look and feel of the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Theme</Label>
                                <p className="text-sm text-muted-foreground">
                                    Select your preferred theme.
                                </p>
                            </div>
                            <ModeToggle />
                        </div>
                    </CardContent>
                </Card>

                <Separator className="my-8" />

                {/* Developer Section */}
                <div>
                    <h3 className="text-lg font-medium mb-2">About the Developer</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Meet the creator of CodeMind and learn how you can support this project.
                    </p>
                </div>

                <Card className="border-primary/20">
                    <CardHeader>
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src="https://avatars.githubusercontent.com/u/42066138?s=400&u=25eb6cfd0661f164d921dd6fd29703e4ecdf39bb&v=4" alt="Prasanth Sekar" />
                                <AvatarFallback className="text-lg">PS</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                    Prasanth Sekar
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                                        <Briefcase className="h-3 w-3" />
                                        Available for Work
                                    </span>
                                </CardTitle>
                                <CardDescription className="mt-2 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Berlin, Germany
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Frontend developer specialized in Angular, React, and Next.js, with a strong focus on creating
                            accessible, user-centered interfaces. Experienced in delivering high-quality digital experiences
                            for diverse audiences and building scalable frontend architectures. Currently seeking new job
                            opportunities in Germany.
                        </p>

                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                asChild
                            >
                                <a href="https://prasanthsekar.info" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                    Portfolio
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                asChild
                            >
                                <a href="https://github.com/prasanth003" target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4" />
                                    GitHub
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-blue-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-500" />
                                Feedback
                            </CardTitle>
                            <CardDescription>
                                Share your thoughts, report bugs, or request features.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Your feedback helps improve CodeMind. Open an issue on GitHub to share your ideas or report problems.
                            </p>
                            <Button
                                variant="default"
                                className="w-full gap-2"
                                asChild
                            >
                                <a href="https://github.com/prasanth003/CodeMind/issues" target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4" />
                                    Give Feedback
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-pink-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-pink-500" />
                                Support
                            </CardTitle>
                            <CardDescription>
                                Help keep this project alive and growing.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                If you find CodeMind useful, consider supporting its development. Your support means a lot!
                            </p>
                            <Button
                                variant="default"
                                className="w-full gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                                asChild
                            >
                                <a href="https://github.com/prasanth003/CodeMind" target="_blank" rel="noopener noreferrer">
                                    <Heart className="h-4 w-4" />
                                    Support the Project
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
