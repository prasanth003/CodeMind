import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { encode } from '@mhriyad/toon-package';
import { z } from 'zod';

const requestSchema = z.object({
    code: z.string().min(1, "Code is required"),
    filePath: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, filePath } = requestSchema.parse(body);

        const inputData = {
            filePath: filePath || "unknown",
            code,
        };

        // Convert to TOON format for token efficiency
        // @ts-ignore
        const toonInput = encode(inputData);

        const model = new ChatOpenAI({
            modelName: 'gpt-4o-mini',
            temperature: 0.2, // Lower temperature for structured output
            openAIApiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = PromptTemplate.fromTemplate(`
      You are a senior code reviewer. Analyze the code provided in TOON format.
      The input is an array of objects, each containing "path" and "content".
      
      Input (TOON):
      {toonInput}

      Return a JSON object with a "suggestions" array. Each suggestion should have:
      - id: string (unique)
      - type: "warning" | "info"
      - title: string (short summary)
      - description: string (detailed explanation)
      - file: string (EXACT path from the input object)
      - recommendation: string (code snippet or specific action)

      Example JSON:
      {{
        "suggestions": [
          {{
            "id": "1",
            "type": "warning",
            "title": "Large Component Detected",
            "description": "Component exceeds 400 lines.",
            "file": "src/components/Dashboard.tsx",
            "recommendation": "Split into DashboardHeader and StatsGrid."
          }}
        ]
      }}

      Ensure valid JSON output only.
    `);

        const chain = prompt.pipe(model);

        const result = await chain.invoke({
            toonInput,
        });

        // Parse the JSON content from the message
        let parsedResult;
        try {
            // Handle potential markdown code blocks in response
            const cleanContent = result.content.toString().replace(/```json/g, '').replace(/```/g, '').trim();
            parsedResult = JSON.parse(cleanContent);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback or error handling
            parsedResult = { suggestions: [] };
        }

        return NextResponse.json(parsedResult);

    } catch (error) {
        console.error("AI Refactor Error:", error);
        return NextResponse.json(
            { error: "Failed to generate refactor suggestions" },
            { status: 500 }
        );
    }
}
