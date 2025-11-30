import { ProjectData } from "@/lib/file-processor";

export interface ApiEndpoint {
    method: string;
    url: string;
    sourceFile: string;
    line: number;
    type: 'client-call' | 'server-route';
}

export class ApiFlowAnalyzer {
    private projectData: ProjectData;

    constructor(projectData: ProjectData) {
        this.projectData = projectData;
    }

    public analyze(): ApiEndpoint[] {
        const endpoints: ApiEndpoint[] = [];
        const { files, metadata } = this.projectData;
        const isAngular = metadata?.framework === 'Angular';

        for (const [path, content] of Object.entries(files)) {
            if (isAngular) {
                endpoints.push(...this.analyzeAngularFile(content, path));
            } else {
                endpoints.push(...this.analyzeReactFile(content, path));
            }

            // Also check for Next.js API routes if applicable
            if (path.includes('/app/api/') || path.includes('/pages/api/')) {
                endpoints.push(...this.analyzeNextJsRoute(content, path));
            }
        }

        return endpoints;
    }

    private analyzeAngularFile(content: string, path: string): ApiEndpoint[] {
        const endpoints: ApiEndpoint[] = [];
        // Look for HttpClient usage
        // this.http.get<Type>('url')
        const regex = /\.http\.(get|post|put|delete|patch)(?:<[^>]+>)?\s*\(\s*['"`]([^'"`]+)['"`]/g;

        let match;
        while ((match = regex.exec(content)) !== null) {
            endpoints.push({
                method: match[1].toUpperCase(),
                url: match[2],
                sourceFile: path,
                line: this.getLineNumber(content, match.index),
                type: 'client-call'
            });
        }
        return endpoints;
    }

    private analyzeReactFile(content: string, path: string): ApiEndpoint[] {
        const endpoints: ApiEndpoint[] = [];

        // 1. fetch('url', options)
        const fetchRegex = /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g;
        let match;
        while ((match = fetchRegex.exec(content)) !== null) {
            endpoints.push({
                method: 'GET', // Default, hard to parse options without AST
                url: match[1],
                sourceFile: path,
                line: this.getLineNumber(content, match.index),
                type: 'client-call'
            });
        }

        // 2. axios.get('url')
        const axiosRegex = /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
        while ((match = axiosRegex.exec(content)) !== null) {
            endpoints.push({
                method: match[1].toUpperCase(),
                url: match[2],
                sourceFile: path,
                line: this.getLineNumber(content, match.index),
                type: 'client-call'
            });
        }

        return endpoints;
    }

    private analyzeNextJsRoute(content: string, path: string): ApiEndpoint[] {
        const endpoints: ApiEndpoint[] = [];
        // Detect HTTP methods exported in route.ts
        const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

        for (const method of methods) {
            if (new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\s*\\(`).test(content)) {
                // Construct route URL from path
                // /app/api/users/route.ts -> /api/users
                const url = path.split('/app')[1]?.replace('/route.ts', '') || path;
                endpoints.push({
                    method,
                    url,
                    sourceFile: path,
                    line: 1, // Approximate
                    type: 'server-route'
                });
            }
        }
        return endpoints;
    }

    private getLineNumber(content: string, index: number): number {
        return content.substring(0, index).split('\n').length;
    }
}
