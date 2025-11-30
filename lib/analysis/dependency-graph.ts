import { ProjectData } from "@/lib/file-processor";

export interface DependencyNode {
    id: string;
    path: string;
    type: 'file' | 'external';
    dependencies: string[]; // IDs of dependencies
}

export class DependencyGraphBuilder {
    private projectData: ProjectData;

    constructor(projectData: ProjectData) {
        this.projectData = projectData;
    }

    public build(): DependencyNode[] {
        const nodes: DependencyNode[] = [];
        const { files } = this.projectData;

        for (const [path, content] of Object.entries(files)) {
            if (!this.isCodeFile(path)) continue;

            const dependencies = this.extractDependencies(content, path);

            nodes.push({
                id: path,
                path,
                type: 'file',
                dependencies
            });
        }

        return nodes;
    }

    private isCodeFile(path: string): boolean {
        return /\.(ts|tsx|js|jsx|css|scss|less)$/.test(path) ||
            /\.(component|service|module|pipe|guard|directive)\.ts$/.test(path);
    }

    private extractDependencies(content: string, currentPath: string): string[] {
        const dependencies: string[] = [];
        // Support static imports and dynamic imports
        const regex = /import\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)|import\(['"]([^'"]+)['"]\)/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            const importPath = match[1] || match[2] || match[3];
            if (!importPath) continue;

            if (importPath.startsWith('.')) {
                // Local dependency
                const resolved = this.resolvePath(currentPath, importPath);
                dependencies.push(resolved);
            } else {
                // External dependency
                dependencies.push(importPath);
            }
        }

        // CSS imports
        if (currentPath.match(/\.(css|scss|less)$/)) {
            const cssRegex = /@import\s+['"]([^'"]+)['"]/g;
            while ((match = cssRegex.exec(content)) !== null) {
                const importPath = match[1];
                if (importPath.startsWith('.')) {
                    dependencies.push(this.resolvePath(currentPath, importPath));
                } else {
                    dependencies.push(importPath);
                }
            }
        }

        return dependencies;
    }

    private resolvePath(currentPath: string, importPath: string): string {
        const dir = currentPath.substring(0, currentPath.lastIndexOf('/'));
        const parts = importPath.split('/');
        const stack = dir.split('/').filter(Boolean);

        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                stack.pop();
            } else {
                stack.push(part);
            }
        }

        return '/' + stack.join('/');
    }
}
