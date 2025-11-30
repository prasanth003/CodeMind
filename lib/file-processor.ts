import JSZip from 'jszip';

export interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    content?: string;
    children?: FileNode[];
    language?: string;
    size?: number;
}

export interface ProjectData {
    files: Record<string, string>; // Map of path -> content
    tree: FileNode;
    fileCount: number;
    metadata?: {
        name: string;
        version: string;
        framework?: string;
        frameworkVersion?: string;
    };
}

export async function processZipFile(file: File): Promise<ProjectData> {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const files: Record<string, string> = {};
    const root: FileNode = {
        name: 'root',
        path: '/',
        type: 'directory',
        children: []
    };

    let fileCount = 0;
    let metadata = {
        name: 'Project',
        version: '0.0.0',
        framework: undefined as string | undefined,
        frameworkVersion: undefined as string | undefined
    };

    // First pass: Read all files
    const entries = Object.keys(contents.files);

    for (const path of entries) {
        const entry = contents.files[path];
        if (!entry.dir) {
            const content = await entry.async('string');
            // Normalize path to ensure it starts with /
            const normalizedPath = path.startsWith('/') ? path : `/${path}`;
            files[normalizedPath] = content;
            fileCount++;

            // Check for package.json
            if (normalizedPath.endsWith('package.json')) {
                try {
                    const pkg = JSON.parse(content);
                    if (pkg.name) metadata.name = pkg.name;
                    if (pkg.version) metadata.version = pkg.version;

                    // Detect framework
                    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                    if (deps['next']) {
                        metadata.framework = 'Next.js';
                        metadata.frameworkVersion = deps['next'].replace(/[^0-9.]/g, '');
                    } else if (deps['react']) {
                        metadata.framework = 'React';
                        metadata.frameworkVersion = deps['react'].replace(/[^0-9.]/g, '');
                    } else if (deps['@angular/core']) {
                        metadata.framework = 'Angular';
                        metadata.frameworkVersion = deps['@angular/core'].replace(/[^0-9.]/g, '');
                    } else if (deps['vue']) {
                        metadata.framework = 'Vue';
                        metadata.frameworkVersion = deps['vue'].replace(/[^0-9.]/g, '');
                    }
                } catch (e) {
                    console.warn('Failed to parse package.json', e);
                }
            }

            // Build tree
            addToTree(root, normalizedPath, content, (entry as any)._data.uncompressedSize);
        }
    }

    return { files, tree: root, fileCount, metadata };
}

function addToTree(root: FileNode, path: string, content: string, size: number) {
    const parts = path.split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;

        if (!current.children) current.children = [];

        let child = current.children.find(c => c.name === part);

        if (!child) {
            child = {
                name: part,
                path: current.path === '/' ? `/${part}` : `${current.path}/${part}`,
                type: isFile ? 'file' : 'directory',
                children: isFile ? undefined : [],
                size: isFile ? size : undefined,
                language: isFile ? getLanguage(part) : undefined,
                content: isFile ? content : undefined
            };
            current.children.push(child);
        }

        current = child;
    }
}

function getLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'css':
        case 'scss':
        case 'less':
            return 'css';
        case 'json':
            return 'json';
        case 'md':
            return 'markdown';
        default:
            return 'plaintext';
    }
}
