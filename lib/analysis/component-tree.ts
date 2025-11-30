import { ProjectData } from "@/lib/file-processor";

export interface ComponentNode {
    id: string;
    name: string;
    type: 'component' | 'page' | 'layout';
    filePath: string;
    children: string[]; // IDs of children
    parentId?: string;
}

export class ComponentTreeBuilder {
    private components: Map<string, ComponentNode> = new Map();
    private projectData: ProjectData;

    constructor(projectData: ProjectData) {
        this.projectData = projectData;
    }

    public build(): ComponentNode[] {
        this.components.clear();
        const { files, metadata } = this.projectData;
        const isAngular = metadata?.framework === 'Angular';

        if (isAngular) {
            this.analyzeAngularComponents(files);
        } else {
            this.analyzeReactComponents(files);
        }

        return Array.from(this.components.values());
    }

    private analyzeReactComponents(files: Record<string, string>) {
        // 1. Identify all components
        for (const [path, content] of Object.entries(files)) {
            if (!path.match(/\.(tsx|jsx)$/)) continue;

            const componentName = this.extractReactComponentName(content, path);
            if (componentName) {
                const id = path;
                this.components.set(id, {
                    id,
                    name: componentName,
                    type: path.includes('page.') ? 'page' : path.includes('layout.') ? 'layout' : 'component',
                    filePath: path,
                    children: []
                });
            }
        }

        // 2. Build relationships
        for (const [path, content] of Object.entries(files)) {
            if (!this.components.has(path)) continue;
            const parentNode = this.components.get(path)!;

            // Find imports to map local names to file paths
            const imports = this.extractImports(content, path);

            // Find JSX usage
            const usedComponents = this.extractUsedComponents(content);

            for (const usedName of usedComponents) {
                const importPath = imports.get(usedName);
                if (importPath) {
                    // Try to find the component with this path
                    // We might need to try a few variations if the extension is missing
                    let resolvedId = importPath;
                    if (this.components.has(resolvedId)) {
                        parentNode.children.push(resolvedId);
                        const childNode = this.components.get(resolvedId)!;
                        childNode.parentId = path;
                    } else {
                        // Try adding extensions
                        const extensions = ['.tsx', '.jsx', '/index.tsx', '/index.jsx'];
                        for (const ext of extensions) {
                            if (this.components.has(resolvedId + ext)) {
                                resolvedId = resolvedId + ext;
                                parentNode.children.push(resolvedId);
                                const childNode = this.components.get(resolvedId)!;
                                childNode.parentId = path;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    private analyzeAngularComponents(files: Record<string, string>) {
        const selectorMap = new Map<string, string>(); // selector -> filePath
        const classMap = new Map<string, string>(); // className -> filePath
        const fileToClass = new Map<string, string>(); // filePath -> className

        // 1. Identify all components, modules, and their selectors
        for (const [path, content] of Object.entries(files)) {
            if (!path.endsWith('.ts')) continue;

            const selector = this.extractAngularSelector(content);
            const className = this.extractAngularClassName(content);
            const isComponent = content.includes('@Component');
            const isModule = content.includes('@NgModule');

            if (className) {
                if (selector) selectorMap.set(selector, path);
                classMap.set(className, path);
                fileToClass.set(path, className);

                if (isComponent || isModule) {
                    this.components.set(path, {
                        id: path,
                        name: className,
                        type: isModule ? 'layout' : 'component', // Treat modules as layout nodes for grouping
                        filePath: path,
                        children: []
                    });
                }
            }
        }

        // 2. Build relationships
        // Strategy: 
        // a. Template usage (Parent uses Child selector)
        // b. Module declarations (Module declares Component)
        // c. Directory structure (Fallback)

        for (const [path, node] of this.components.entries()) {
            const content = files[path];

            // A. Check Template Usage (for Components)
            if (node.type === 'component') {
                let template = this.extractAngularTemplate(content);
                if (!template) {
                    const templateUrl = this.extractAngularTemplateUrl(content);
                    if (templateUrl) {
                        const dir = path.substring(0, path.lastIndexOf('/'));
                        const templatePath = `${dir}/${templateUrl.replace(/^\.\//, '')}`;
                        template = files[templatePath] || '';
                    }
                }

                if (template) {
                    for (const [selector, childPath] of selectorMap.entries()) {
                        if (childPath === path) continue;
                        const regex = new RegExp(`<${selector}[\\s>]`);
                        if (regex.test(template)) {
                            this.linkParentChild(path, childPath);
                        }
                    }
                }
            }

            // B. Check Module Declarations/Imports/Exports
            if (node.type === 'layout') { // It's a module
                const declarationsMatch = content.match(/declarations:\s*\[([^\]]+)\]/);
                const importsMatch = content.match(/imports:\s*\[([^\]]+)\]/);
                const exportsMatch = content.match(/exports:\s*\[([^\]]+)\]/);

                const processList = (listStr: string) => {
                    const list = listStr.split(',').map(s => s.trim());
                    for (const item of list) {
                        const childPath = classMap.get(item);
                        if (childPath && childPath !== path) {
                            this.linkParentChild(path, childPath);
                        }
                    }
                };

                if (declarationsMatch) processList(declarationsMatch[1]);
                if (importsMatch) processList(importsMatch[1]);
                if (exportsMatch) processList(exportsMatch[1]);

                // C. Check Lazy Loading (loadChildren) in Routing Modules
                // Look for: loadChildren: () => import('./path/to/module').then(m => m.ModuleName)
                const lazyRegex = /loadChildren:\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/g;
                let match;
                while ((match = lazyRegex.exec(content)) !== null) {
                    const importPath = match[1];
                    const resolvedPath = this.resolvePath(path, importPath);

                    // Try to find the module file at this path
                    // It might be resolvedPath + '.ts' or resolvedPath + '/module-name.ts'
                    // We search our components map for a match
                    for (const [compPath, compNode] of this.components.entries()) {
                        if (compNode.type === 'layout' && compPath.startsWith(resolvedPath)) {
                            this.linkParentChild(path, compPath);
                        }
                    }
                }
            }
        }

        // 3. Post-processing: Directory-based hierarchy for orphans
        // If a component has no parent, try to find a "parent" component/module in the parent directory
        // We sort by path length descending to handle deepest orphans first
        const sortedPaths = Array.from(this.components.keys()).sort((a, b) => b.length - a.length);

        for (const path of sortedPaths) {
            const node = this.components.get(path);
            if (!node || node.parentId) continue;

            // Skip root app component/module
            if (path.includes('app.component.ts') || path.includes('app.module.ts')) continue;

            const dir = path.substring(0, path.lastIndexOf('/'));

            // 1. Look for a Module in the SAME directory
            let parentFound = false;
            for (const [potentialParentPath, parentNode] of this.components.entries()) {
                // Check if potential parent is a module in the same directory
                const potentialParentDir = potentialParentPath.substring(0, potentialParentPath.lastIndexOf('/'));
                if (potentialParentPath !== path && potentialParentDir === dir && parentNode.type === 'layout') {
                    this.linkParentChild(potentialParentPath, path);
                    parentFound = true;
                    break;
                }
            }
            if (parentFound) continue;

            // 2. Look for a Module/Component in the PARENT directory
            const parentDir = dir.substring(0, dir.lastIndexOf('/'));
            if (parentDir) {
                for (const [potentialParentPath, parentNode] of this.components.entries()) {
                    // Check if potential parent is in the parent directory (direct child of parentDir)
                    const potentialParentDir = potentialParentPath.substring(0, potentialParentPath.lastIndexOf('/'));
                    if (potentialParentDir === parentDir && parentNode.type === 'layout') {
                        this.linkParentChild(potentialParentPath, path);
                        parentFound = true;
                        break;
                    }
                }
            }
        }
    }

    private linkParentChild(parentId: string, childId: string) {
        const parent = this.components.get(parentId);
        const child = this.components.get(childId);

        if (parent && child && !parent.children.includes(childId)) {
            // Avoid cycles
            if (this.isAncestor(childId, parentId)) return;

            // If child already has a parent, we might be moving it or adding a second parent (graph vs tree)
            // For tree visualization, we prefer single parent. 
            // If the new parent is a Module and old was a Component, keep Component (more specific).
            // If both are same type, keep first? Or allow multiple? 
            // Let's allow reparenting if the new parent is "closer" or more specific, but simple logic for now:
            if (!child.parentId) {
                parent.children.push(childId);
                child.parentId = parentId;
            }
        }
    }

    private isAncestor(potentialAncestor: string, node: string): boolean {
        let current = this.components.get(node);
        while (current && current.parentId) {
            if (current.parentId === potentialAncestor) return true;
            current = this.components.get(current.parentId);
        }
        return false;
    }

    private extractReactComponentName(content: string, path: string): string | null {
        // 1. export default function ComponentName
        const defaultFn = content.match(/export\s+default\s+function\s+(\w+)/);
        if (defaultFn) return defaultFn[1];

        // 2. export default class ComponentName
        const defaultClass = content.match(/export\s+default\s+class\s+(\w+)/);
        if (defaultClass) return defaultClass[1];

        // 3. export const ComponentName = ...
        const exportConst = content.match(/export\s+const\s+(\w+)\s*=\s*(?:function|\(|async)/);
        if (exportConst) return exportConst[1];

        // 4. export function ComponentName
        const exportFn = content.match(/export\s+function\s+(\w+)/);
        if (exportFn) return exportFn[1];

        // 5. const ComponentName = ...; export default ComponentName;
        const defaultExport = content.match(/export\s+default\s+(\w+)/);
        if (defaultExport) {
            // Verify it's defined as a component-like thing
            const name = defaultExport[1];
            if (content.match(new RegExp(`(?:const|function|class)\\s+${name}`))) {
                return name;
            }
        }

        // Fallback: Filename if it looks like a component
        const filename = path.split('/').pop()?.split('.')[0];
        return filename && /^[A-Z]/.test(filename) ? filename : null;
    }

    private extractImports(content: string, currentPath: string): Map<string, string> {
        const imports = new Map<string, string>();
        // Improved regex to handle newlines and multiple named imports
        const regex = /import\s+(?:(\w+)|(?:\{([^}]+)\})|(?:\*\s+as\s+(\w+)))\s+from\s+['"]([^'"]+)['"]/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            const defaultImport = match[1];
            const namedImports = match[2];
            const namespaceImport = match[3];
            const importPath = match[4];

            if (!importPath.startsWith('.')) continue;

            const resolvedPath = this.resolvePath(currentPath, importPath);

            if (defaultImport) {
                imports.set(defaultImport, resolvedPath);
            }
            if (namespaceImport) {
                imports.set(namespaceImport, resolvedPath);
            }
            if (namedImports) {
                // Handle aliases: { Foo as Bar, Baz }
                namedImports.split(',').forEach(item => {
                    const parts = item.trim().split(/\s+as\s+/);
                    if (parts.length === 2) {
                        imports.set(parts[1], resolvedPath); // Key is alias (Bar)
                    } else {
                        imports.set(parts[0], resolvedPath); // Key is name (Baz)
                    }
                });
            }
        }
        return imports;
    }

    private resolvePath(currentPath: string, importPath: string): string {
        const dir = currentPath.substring(0, currentPath.lastIndexOf('/'));
        // Handle ../
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

    private extractUsedComponents(content: string): Set<string> {
        const used = new Set<string>();
        // Match <ComponentName
        const regex = /<([A-Z]\w+)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            used.add(match[1]);
        }
        return used;
    }

    // Angular Helpers
    private extractAngularSelector(content: string): string | null {
        const match = content.match(/selector:\s*['"]([^'"]+)['"]/);
        return match ? match[1] : null;
    }

    private extractAngularClassName(content: string): string | null {
        const match = content.match(/export\s+class\s+(\w+)/);
        return match ? match[1] : null;
    }

    private extractAngularTemplate(content: string): string | null {
        // Support backticks, single quotes, and double quotes
        const match = content.match(/template:\s*(?:`([^`]+)`|'([^']+)'|"([^"]+)")/);
        if (!match) return null;
        return match[1] || match[2] || match[3];
    }

    private extractAngularTemplateUrl(content: string): string | null {
        const match = content.match(/templateUrl:\s*['"]([^'"]+)['"]/);
        return match ? match[1] : null;
    }
}
