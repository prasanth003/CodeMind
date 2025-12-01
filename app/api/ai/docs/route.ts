import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { encode } from '@mhriyad/toon-package';
import { z } from 'zod';

const requestSchema = z.object({
    code: z.string().min(1, "Code is required"),
    type: z.string().default('readme'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, type } = requestSchema.parse(body);

        const inputData = {
            code,
            documentationType: type,
        };

        // Convert to TOON format
        // @ts-ignore
        const toonInput = encode(inputData);

        const model = new ChatOpenAI({
            modelName: 'gpt-4o-mini',
            temperature: 0.1, // Low temperature for precise documentation
            openAIApiKey: process.env.OPENAI_API_KEY,
        });

        let promptText = "";
        switch (type) {
            case 'readme':
                promptText = "Generate a comprehensive README.md for this project. Include setup instructions, scripts, and tech stack details.";
                break;
            case 'architecture':
                promptText = "Create a detailed Architecture Report. Describe the system architecture, data flow, and component hierarchy.";
                break;
            case 'components':
                promptText = "Generate JSDoc/TSDoc style documentation for the main components and hooks found in this structure.";
                break;
            case 'mermaid':
                promptText = "Generate Mermaid JS diagrams (flowcharts or sequence diagrams) representing the project structure and flow. Output ONLY the mermaid code block.";
                break;
            default:
                promptText = "Generate documentation for this code.";
        }

        const prompt = PromptTemplate.fromTemplate(`
      You are a technical writer. 
      Task: ${promptText}
      
      Input (TOON):
      {toonInput}

      Output in Markdown format.
    `);

        const chain = prompt.pipe(model).pipe(new StringOutputParser());

        const stream = await chain.stream({
            toonInput,
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/markdown',
            },
        });

    } catch (error) {
        console.error("AI Docs Error:", error);
        return NextResponse.json(
            { error: "Failed to generate documentation" },
            { status: 500 }
        );
    }
}
