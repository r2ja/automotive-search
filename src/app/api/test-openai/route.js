import { NextResponse } from "next/server";
import { generateOpenAIResponse } from "@/lib/openaiUtil";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = body?.input || "Hello, can you help me find cars?";
    
    console.log("[TEST] Testing OpenAI with input:", input);
    
    const result = await generateOpenAIResponse(input, {
      instructions: "You are a helpful automotive assistant. When users ask about cars, provide helpful recommendations."
    });
    
    return NextResponse.json({
      input,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("[TEST] OpenAI test error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST with { input: 'your message' }",
    example: { input: "Hello, can you help me find cars?" }
  });
}
