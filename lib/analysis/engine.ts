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
                // Regex to find various component definitions
                // 1. export default function ComponentName
                // 2. export function ComponentName
                // 3. export const ComponentName = ...
                // 4. function ComponentName (if exported later)
                // 5. const ComponentName = ... (if exported later)

                const patterns = [
                    /export\s+default\s+function\s+(\w+)/,
                    /export\s+function\s+(\w+)/,
                    /export\s+const\s+(\w+)\s*=\s*(?:\(|async)/,
                    /function\s+(\w+)\s*\(/,
                    /const\s+(\w+)\s*=\s*(?:\(|async\s*\()/
                ];

                const detectedNames = new Set<string>();

                for (const pattern of patterns) {
                    const match = content.match(pattern);
                    if (match && match[1]) {
                        const name = match[1];
                        // Filter out common non-component names if needed, or rely on capitalization convention
                        if (/^[A-Z]/.test(name) && !detectedNames.has(name)) {
                            detectedNames.add(name);
                            components.push({
                                name,
                                path,
                                type: 'component',
                                lineCount: content.split('\n').length
                            });
                        }
                    }
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
        const { files } = this.data;

        for (const [path, content] of Object.entries(files)) {
            if (path.endsWith('.tsx') || path.endsWith('.jsx') || path.endsWith('.ts') || path.endsWith('.js')) {
                // Match import statements
                // import { Foo } from './Foo'
                // import Foo from './Foo'
                // import './style.css'
                const importRegex = /import\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['"]([^'"]+)['"]/g;
                let match;

                while ((match = importRegex.exec(content)) !== null) {
                    const importPath = match[1];
                    // Only track local imports or specific libraries
                    dependencies.push({
                        source: path,
                        target: importPath,
                        type: importPath.startsWith('.') ? 'local' : 'external'
                    });
                }
            }
        }
        return dependencies;
    }
}
