import { ProjectData } from "@/lib/file-processor";
import { ComponentTreeBuilder } from "./component-tree";
import { DependencyGraphBuilder } from "./dependency-graph";
import { ApiFlowAnalyzer } from "./api-flow";

export interface AnalysisConfig {
    detectComponents: boolean;
    detectDependencies: boolean;
    detectRoutes: boolean;
    detectTree?: boolean;
    detectApi?: boolean;
}

export class AnalysisEngine {
    private data: ProjectData;

    constructor(data: ProjectData) {
        this.data = data;
    }

    public async analyze(config: AnalysisConfig = { detectComponents: true, detectDependencies: true, detectRoutes: true, detectTree: true, detectApi: true }) {
        const results = {
            components: [] as any[],
            dependencies: [] as any[],
            routes: [] as any[],
            componentTree: [] as any[],
            apiFlow: [] as any[]
        };

        if (config.detectComponents) {
            results.components = this.detectComponents();
        }

        if (config.detectRoutes) {
            results.routes = this.detectRoutes();
        }

        if (config.detectDependencies) {
            const builder = new DependencyGraphBuilder(this.data);
            results.dependencies = builder.build();
        }

        if (config.detectTree) {
            const builder = new ComponentTreeBuilder(this.data);
            results.componentTree = builder.build();
        }

        if (config.detectApi) {
            const analyzer = new ApiFlowAnalyzer(this.data);
            results.apiFlow = analyzer.analyze();
        }

        return results;
    }

    private detectComponents() {
        const components: any[] = [];
        const { files, metadata } = this.data;
        const isAngular = metadata?.framework === 'Angular';

        for (const [path, content] of Object.entries(files)) {
            if (isAngular) {
                if (path.endsWith('.ts') && content.includes('@Component')) {
                    const nameMatch = content.match(/export\s+class\s+(\w+)/);
                    if (nameMatch) {
                        components.push({
                            name: nameMatch[1],
                            path,
                            type: 'component',
                            lineCount: content.split('\n').length
                        });
                    }
                }
            } else {
                if (path.endsWith('.tsx') || path.endsWith('.jsx')) {
                    // React detection logic
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
        }
        return components;
    }

    private detectRoutes() {
        const routes: any[] = [];
        const { files, metadata } = this.data;
        const isAngular = metadata?.framework === 'Angular';

        if (isAngular) {
            // Basic Angular route detection (looking for path: '...')
            for (const [path, content] of Object.entries(files)) {
                if (path.endsWith('app-routing.module.ts') || path.endsWith('.routes.ts')) {
                    const routeRegex = /path:\s*['"]([^'"]+)['"]/g;
                    let match;
                    while ((match = routeRegex.exec(content)) !== null) {
                        routes.push({
                            path: match[1] === '' ? '/' : `/${match[1]}`,
                            file: path,
                            type: 'page'
                        });
                    }
                }
            }
        } else {
            // Next.js / React Router detection
            for (const path of Object.keys(files)) {
                if (path.includes('/app/') && (path.endsWith('page.tsx') || path.endsWith('page.jsx'))) {
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
        }
        return routes;
    }

    private detectDependencies() {
        // Kept for backward compatibility if needed, but mostly replaced by DependencyGraphBuilder
        // We can delegate to the builder or keep a simple version here
        // For now, let's use the builder in the main analyze method
        return [];
    }
}
