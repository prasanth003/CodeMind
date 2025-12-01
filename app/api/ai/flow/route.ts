import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { encode } from '@mhriyad/toon-package';
import { z } from 'zod';

// Define the schema for the request body
const requestSchema = z.object({
    code: z.string().min(1, "Code is required"),
    context: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, context } = requestSchema.parse(body);

        // Optimize context using TOON to save tokens
        // We wrap the code and context in an object and convert it to TOON format
        const inputData = {
            code,
            context: context || "No additional context provided",
        };

        // Convert to TOON format
        // @ts-ignore - TOON types might be loose, ensuring it works
        const toonInput = encode(inputData);

        const model = new ChatOpenAI({
            modelName: 'gpt-4o-mini', // Using GPT-4 Mini as requested
            temperature: 0.2,
            openAIApiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = PromptTemplate.fromTemplate(`
      You are an expert software engineer. Your task is to analyze the following code and describe the API flow.
      The input is provided in TOON (Token-Oriented Object Notation) format to save tokens.
      
      Input (TOON):
      {toonInput}

      Please provide a clear, step-by-step explanation of the API flow.
      Format your response in Markdown.
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
        console.error("AI Flow Generation Error:", error);
        return NextResponse.json(
            { error: "Failed to generate API flow analysis" },
            { status: 500 }
        );
    }
}
