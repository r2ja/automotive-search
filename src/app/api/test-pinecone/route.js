import { NextResponse } from "next/server";
import { searchPinecone } from "@/lib/pineconeUtil";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body?.query || "honda cars";

    console.log("[TEST] Testing Pinecone with query:", query);

    const result = await searchPinecone(query);

    return NextResponse.json({
      query,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[TEST] Pinecone test error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST with { query: 'your search term' }",
    example: { query: "honda cars" }
  });
}
