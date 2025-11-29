"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FileNode, ProjectData } from '@/lib/file-processor';

interface AnalysisResult {
    components: any[]; // To be defined
    dependencies: any[]; // To be defined
    routes: any[]; // To be defined
}

interface ProjectContextType {
    projectData: ProjectData | null;
    setProjectData: (data: ProjectData | null) => void;
    analysisData: AnalysisResult | null;
    setAnalysisData: (data: AnalysisResult | null) => void;
    isAnalyzing: boolean;
    setIsAnalyzing: (isAnalyzing: boolean) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    return (
        <ProjectContext.Provider
            value={{
                projectData,
                setProjectData,
                analysisData,
                setAnalysisData,
                isAnalyzing,
                setIsAnalyzing,
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
