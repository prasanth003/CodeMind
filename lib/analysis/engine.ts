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
            // Enhanced Angular route detection with hierarchy, guards, and roles
            for (const [path, content] of Object.entries(files)) {
                if (path.includes('routing') || path.includes('.routes')) {
                    // We need a recursive parser or a smarter regex approach to handle nested arrays
                    // For now, we'll use a simplified stack-based approach to find route objects

                    // 1. Find the Routes array
                    const routesMatch = content.match(/Routes\s*=\s*(\[[\s\S]*?\]);/);
                    if (routesMatch) {
                        const routesArrayStr = routesMatch[1];
                        const parsedRoutes = this.parseAngularRoutes(routesArrayStr, path);
                        routes.push(...parsedRoutes);
                    }
                }
            }
        } else {
            // Next.js / React Router detection
            for (const path of Object.keys(files)) {
                if (path.includes('/app/') && (path.endsWith('page.tsx') || path.endsWith('page.jsx'))) {
                    const relativePath = path.split('/app')[1].replace('/page.tsx', '').replace('/page.jsx', '');
                    const routePath = relativePath === '' ? '/' : relativePath;

                    routes.push({
                        path: routePath,
                        file: path,
                        type: 'page',
                        guards: [],
                        roles: []
                    });
                }

                if (path.includes('/app/') && (path.endsWith('route.ts') || path.endsWith('route.js'))) {
                    const routePath = path.split('/app')[1].replace('/route.ts', '').replace('/route.js', '');
                    routes.push({
                        path: routePath,
                        file: path,
                        type: 'api',
                        guards: [],
                        roles: []
                    });
                }
            }
        }
        return routes;
    }

    private parseAngularRoutes(content: string, filePath: string): any[] {
        const routes: any[] = [];
        let depth = 0;
        let currentObject = '';
        let inObject = false;

        // Very basic parser to split objects in the array
        // This is fragile but works for standard formatting
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            if (char === '{') {
                if (depth === 0) inObject = true;
                depth++;
            } else if (char === '}') {
                depth--;
                if (depth === 0 && inObject) {
                    inObject = false;
                    currentObject += char;

                    // Process the captured object string
                    const route = this.extractRouteInfo(currentObject, filePath);
                    if (route) routes.push(route);

                    currentObject = '';
                    continue;
                }
            }

            if (inObject) {
                currentObject += char;
            }
        }
        return routes;
    }

    private extractRouteInfo(objStr: string, filePath: string): any | null {
        // Extract path
        const pathMatch = objStr.match(/path:\s*['"]([^'"]*)['"]/);
        if (!pathMatch) return null; // Skip if no path (e.g. wildcard redirects might be handled differently)

        const path = pathMatch[1];

        // Extract component/loadChildren
        let type = 'page';
        let target = '';
        const compMatch = objStr.match(/component:\s*(\w+)/);
        if (compMatch) {
            target = compMatch[1];
        } else {
            const lazyMatch = objStr.match(/loadChildren:\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/);
            if (lazyMatch) {
                type = 'module';
                target = lazyMatch[1];
            }
        }

        // Extract Guards (canActivate)
        const guards: string[] = [];
        const guardsMatch = objStr.match(/canActivate:\s*\[([^\]]+)\]/);
        if (guardsMatch) {
            guards.push(...guardsMatch[1].split(',').map(s => s.trim()));
        }

        // Extract Roles (data: { roles: [...] })
        const roles: string[] = [];
        const dataMatch = objStr.match(/data:\s*\{[^}]*roles:\s*\[([^\]]+)\][^}]*\}/);
        if (dataMatch) {
            roles.push(...dataMatch[1].split(',').map(s => s.replace(/['"]/g, '').trim()));
        }

        // Extract Children (recursive)
        const children: any[] = [];
        const childrenMatch = objStr.match(/children:\s*(\[[\s\S]*?\])/);
        if (childrenMatch) {
            // Recursively parse children
            // Note: This simple recursion might fail on complex nested brackets without a proper parser
            // For now, we try to parse the inner array
            children.push(...this.parseAngularRoutes(childrenMatch[1], filePath));
        }

        return {
            path,
            file: filePath,
            type,
            target,
            guards,
            roles,
            children
        };
    }

    private detectDependencies() {
        // Kept for backward compatibility if needed, but mostly replaced by DependencyGraphBuilder
        // We can delegate to the builder or keep a simple version here
        // For now, let's use the builder in the main analyze method
        return [];
    }
}
