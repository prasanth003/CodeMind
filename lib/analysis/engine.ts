import { ProjectData } from "@/lib/file-processor";

export interface AnalysisConfig {
    detectComponents: boolean;
    detectDependencies: boolean;
    detectRoutes: boolean;
}

export class AnalysisEngine {
    private data: ProjectData;

    constructor(data: ProjectData) {
        this.data = data;
    }

    public async analyze(config: AnalysisConfig = { detectComponents: true, detectDependencies: true, detectRoutes: true }) {
        const results = {
            components: [] as any[],
            dependencies: [] as any[],
            routes: [] as any[]
        };

        if (config.detectComponents) {
            results.components = this.detectComponents();
        }

        if (config.detectRoutes) {
            results.routes = this.detectRoutes();
        }

        // Dependencies are often derived from components, so we might want to pass components in
        if (config.detectDependencies) {
            results.dependencies = this.detectDependencies();
        }

        return results;
    }

    private detectComponents() {
        const components: any[] = [];
        const { files } = this.data;

        for (const [path, content] of Object.entries(files)) {
            if (path.endsWith('.tsx') || path.endsWith('.jsx')) {
                // Simple regex to find function components
                // export default function ComponentName
                // export const ComponentName = () =>
                const functionMatch = content.match(/export\s+default\s+function\s+(\w+)/);
                const constMatch = content.match(/export\s+const\s+(\w+)\s*=\s*(\(|async)/);

                if (functionMatch || constMatch) {
                    const name = functionMatch ? functionMatch[1] : constMatch![1];
                    components.push({
                        name,
                        path,
                        type: 'component',
                        lineCount: content.split('\n').length
                    });
                }
            }
        }
        return components;
    }

    private detectRoutes() {
        const routes: any[] = [];
        const { files } = this.data;

        for (const path of Object.keys(files)) {
            if (path.includes('/app/') && (path.endsWith('page.tsx') || path.endsWith('page.jsx'))) {
                // Extract route from path
                // /app/dashboard/page.tsx -> /dashboard
                // /app/page.tsx -> /
                let routePath = path.split('/app')[1].replace('/page.tsx', '').replace('/page.jsx', '');
                if (routePath === '') routePath = '/';

                routes.push({
                    path: routePath,
                    file: path,
                    type: 'page'
                });
            }

            if (path.includes('/app/') && (path.endsWith('route.ts') || path.endsWith('route.js'))) {
                let routePath = path.split('/app')[1].replace('/route.ts', '').replace('/route.js', '');
                routes.push({
                    path: routePath,
                    file: path,
                    type: 'api'
                });
            }
        }
        return routes;
    }

    private detectDependencies() {
        const dependencies: any[] = [];
        // Placeholder for dependency analysis
        // In a real implementation, we would parse imports
        return dependencies;
    }
}
