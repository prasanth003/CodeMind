"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FileNode, ProjectData } from '@/lib/file-processor';

interface AnalysisResult {
    components: any[]; // To be defined
    dependencies: any[]; // To be defined
    routes: any[]; // To be defined
}

interface ProjectMetadata {
    name: string;
    version: string;
    framework?: string;
    frameworkVersion?: string;
}

interface ProjectContextType {
    projectData: ProjectData | null;
    setProjectData: (data: ProjectData | null) => void;
    analysisData: AnalysisResult | null;
    setAnalysisData: (data: AnalysisResult | null) => void;
    isAnalyzing: boolean;
    setIsAnalyzing: (isAnalyzing: boolean) => void;
    selectedFile: FileNode | null;
    setSelectedFile: (file: FileNode | null) => void;
    projectMetadata: ProjectMetadata | null;
    setProjectMetadata: (metadata: ProjectMetadata | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [projectMetadata, setProjectMetadata] = useState<ProjectMetadata | null>(null);

    return (
        <ProjectContext.Provider
            value={{
                projectData,
                setProjectData,
                analysisData,
                setAnalysisData,
                isAnalyzing,
                setIsAnalyzing,
                selectedFile,
                setSelectedFile,
                projectMetadata,
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
