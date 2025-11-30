import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const repoUrl = searchParams.get('url');

    if (!repoUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Parse owner and repo from URL
    // Expected format: https://github.com/owner/repo
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
        return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
    }

    const [, owner, repo] = match;
    const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball`;

    try {
        const response = await fetch(zipUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                // Add token if available in env for higher rate limits
                ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {})
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: `GitHub API error: ${response.statusText}` }, { status: response.status });
        }

        // Forward the zip file
        const blob = await response.blob();
        const headers = new Headers();
        headers.set('Content-Type', 'application/zip');
        headers.set('Content-Disposition', `attachment; filename="${repo}.zip"`);

        return new NextResponse(blob, { headers });
    } catch (error) {
        console.error('GitHub download error:', error);
        return NextResponse.json({ error: 'Failed to download repository' }, { status: 500 });
    }
}
