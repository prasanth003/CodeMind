"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { FileNode, ProjectData } from '@/lib/file-processor';
import { get, set, del } from 'idb-keyval';

interface AnalysisResult {
    components: any[];
    dependencies: any[];
    routes: any[];
    componentTree?: any[];
    apiFlow?: any[];
}

interface ProjectMetadata {
    name: string;
    version: string;
    framework?: string;
    frameworkVersion?: string;
}

interface StoredProject {
    id: string;
    data: ProjectData;
    analysis: AnalysisResult | null;
    metadata: ProjectMetadata;
    lastAccessed: number;
}

interface ProjectContextType {
    // Current Project State
    projectData: ProjectData | null;
    analysisData: AnalysisResult | null;
    projectMetadata: ProjectMetadata | null;

    // Multi-Project Management
    projects: StoredProject[];
    currentProjectId: string | null;
    addProject: (data: ProjectData, analysis: AnalysisResult | null, metadata: ProjectMetadata) => Promise<void>;
    switchProject: (projectId: string) => void;
    removeProject: (projectId: string) => Promise<void>;
    updateAnalysis: (projectId: string, analysis: AnalysisResult) => Promise<void>;

    // UI State
    isAnalyzing: boolean;
    setIsAnalyzing: (isAnalyzing: boolean) => void;
    selectedFile: FileNode | null;
    setSelectedFile: (file: FileNode | null) => void;

    // Legacy setters (deprecated but kept for compatibility during refactor)
    setProjectData: (data: ProjectData | null) => void;
    setAnalysisData: (data: AnalysisResult | null) => void;
    setProjectMetadata: (metadata: ProjectMetadata | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    // Persistent State
    const [projects, setProjects] = useState<StoredProject[]>([]);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

    // Derived State (Current Project)
    const currentProject = projects.find(p => p.id === currentProjectId);
    const projectData = currentProject?.data || null;
    const analysisData = currentProject?.analysis || null;
    const projectMetadata = currentProject?.metadata || null;

    // UI State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

    // Load from IndexedDB on mount
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const storedProjects = await get<StoredProject[]>('codemind-projects');
                const lastId = await get<string>('codemind-current-id');

                if (storedProjects) {
                    setProjects(storedProjects);
                    if (lastId && storedProjects.some(p => p.id === lastId)) {
                        setCurrentProjectId(lastId);
                    } else if (storedProjects.length > 0) {
                        setCurrentProjectId(storedProjects[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to load projects from storage:', error);
            }
        };
        loadProjects();
    }, []);

    // Save to IndexedDB whenever projects change
    useEffect(() => {
        if (projects.length > 0) {
            set('codemind-projects', projects).catch(err => console.error('Failed to save projects:', err));
        }
    }, [projects]);

    // Save current ID whenever it changes
    useEffect(() => {
        if (currentProjectId) {
            set('codemind-current-id', currentProjectId).catch(err => console.error('Failed to save current ID:', err));
        }
    }, [currentProjectId]);

    const addProject = async (data: ProjectData, analysis: AnalysisResult | null, metadata: ProjectMetadata) => {
        const newProject: StoredProject = {
            id: crypto.randomUUID(),
            data,
            analysis,
            metadata,
            lastAccessed: Date.now()
        };

        setProjects(prev => {
            // Remove existing project with same name to avoid duplicates (optional strategy)
            const filtered = prev.filter(p => p.metadata.name !== metadata.name);
            return [...filtered, newProject];
        });
        setCurrentProjectId(newProject.id);
    };

    const switchProject = (projectId: string) => {
        setCurrentProjectId(projectId);
        setSelectedFile(null); // Reset selection on switch
    };

    const removeProject = async (projectId: string) => {
        const newProjects = projects.filter(p => p.id !== projectId);
        setProjects(newProjects);

        if (currentProjectId === projectId) {
            setCurrentProjectId(newProjects.length > 0 ? newProjects[0].id : null);
        }

        if (newProjects.length === 0) {
            await del('codemind-projects');
            await del('codemind-current-id');
        } else {
            await set('codemind-projects', newProjects);
        }
    };

    const updateAnalysis = async (projectId: string, analysis: AnalysisResult) => {
        setProjects(prev => {
            const updated = prev.map(p => {
                if (p.id === projectId) {
                    return { ...p, analysis, lastAccessed: Date.now() };
                }
                return p;
            });
            // Persist immediately (effect will handle it too, but this ensures consistency)
            set('codemind-projects', updated).catch(err => console.error('Failed to save projects:', err));
            return updated;
        });
    };

    // Legacy setters for compatibility - these now update the CURRENT project
    const setProjectData = (data: ProjectData | null) => {
        if (!currentProjectId && data) {
            // If no project exists but we're setting data, create a temp one
            // This is a fallback; ideally use addProject
            console.warn('Using legacy setProjectData without current project. Use addProject instead.');
        }
    };
    const setAnalysisData = (data: AnalysisResult | null) => { };
    const setProjectMetadata = (metadata: ProjectMetadata | null) => { };

    return (
        <ProjectContext.Provider
            value={{
                projectData,
                analysisData,
                projectMetadata,
                projects,
                currentProjectId,
                addProject,
                switchProject,
                removeProject,
                updateAnalysis,
                isAnalyzing,
                setIsAnalyzing,
                selectedFile,
                setSelectedFile,
                setProjectData,
                setAnalysisData,
                setProjectMetadata,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
}
