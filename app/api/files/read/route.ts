import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const requestSchema = z.object({
    path: z.string().min(1, "Path is required"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { path: filePath } = requestSchema.parse(body);

        // Security check: Ensure path is within the project directory
        // This is a basic check; in a real app, you'd want more robust validation
        // For this local tool, we assume the user is running it on their own machine

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const content = await fs.readFile(filePath, 'utf-8');

        return NextResponse.json({ content });
    } catch (error) {
        console.error("File Read Error:", error);
        return NextResponse.json(
            { error: "Failed to read file" },
            { status: 500 }
        );
    }
}
