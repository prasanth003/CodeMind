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

            // Build tree
            addToTree(root, normalizedPath, content, (entry as any)._data.uncompressedSize);
        }
    }

    return { files, tree: root, fileCount };
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
