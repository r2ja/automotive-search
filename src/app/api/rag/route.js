// src/app/api/rag/route.js
import { NextResponse } from "next/server";
import { generateOpenAIResponse } from "@/lib/openaiUtil";
import { searchPinecone } from "@/lib/pineconeUtil";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

function extractOutputText(resp) {
  if (!resp) return "";
  if (typeof resp.output_text === "string" && resp.output_text.length) return resp.output_text;
  if (Array.isArray(resp.output)) {
    return resp.output
      .map(item => item?.content?.map(c => (c.type === "output_text" ? c.text : "")).filter(Boolean).join(""))
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function composeImageUrl(carId, baseUrl = process.env.BUCKET_URL) {
  if (!baseUrl || !carId) return null;
  // Remove trailing slash and append car ID
  const base = baseUrl.replace(/\/$/, '');
  const imageUrl = `${base}/${carId}.jpg`;
  console.log("[composeImageUrl] Generated URL:", imageUrl);
  return imageUrl;
}

export async function POST(req) {
  try {
    console.log("[RAG] ✅ Endpoint hit");

    const body = await req.json().catch(() => ({}));
    const query = (body?.query || "").toString().trim();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    console.log("[RAG] Request body:", { query, messagesLength: messages.length });

    if (!query) {
      return NextResponse.json({ error: "Missing 'query' in request body" }, { status: 400 });
    }

    // --- Step 0: sanity checks for keys/env ---
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_HOST_URL) return NextResponse.json({ error: "Pinecone credentials missing" }, { status: 500 });

    const INDEX_NAME = process.env.PINECONE_INDEX_NAME || "automotive";
    const NAMESPACE = process.env.PINECONE_NAMESPACE || "ns1";

    // --- Step 1: initial OpenAI decision call ---
    const systemInstruction = `You are a helpful automotive assistant. Decide whether the user's query requires searching our car DB. If so, respond concisely and don't ask to confirm — allow the system to search.`;

    // Use your OpenAI util to decide (we pass messages array if present)
    const decisionResult = await generateOpenAIResponse(query, {
      model: "gpt-4o-mini",
      instructions: systemInstruction,
      messages: [
        // include any previous conversation (if provided)
        ...messages,
        { role: "user", content: query }
      ]
    });

    const decisionText = extractOutputText(decisionResult.fullResponse) || decisionResult.text || "";
    console.log("[RAG] Decision text:", decisionText.slice(0, 800));

    // Determine whether to query Pinecone: check user query or model decision
    const userIntent = /find|show|recommend|list|suggest|under|budget|cheap|mileage|efficient|suv|sedan|hatchback|buy/i.test(query);
    const modelIntent = /find|show|recommend|list|suggest/i.test(decisionText);
    const readyToQuery = Boolean(userIntent || modelIntent);

    console.log("[RAG] readyToQuery:", readyToQuery);

    let contextChunks = [];
    let carIds = [];
    let cars = [];
    let finalAnswer = decisionText || "Okay.";

    if (readyToQuery) {
      // --- Step 2: search Pinecone for relevant chunks ---
      console.log("[RAG] Querying Pinecone for:", query);
      const pineconeRes = await searchPinecone(query, { topK: 8, namespace: NAMESPACE });
      if (!pineconeRes?.success) {
        console.warn("[RAG] Pinecone search returned failure:", pineconeRes?.error);
      }

      const matches = Array.isArray(pineconeRes.matches) ? pineconeRes.matches : [];
      console.log("[RAG] Pinecone matches received:", matches.length);

      // map matches -> contextChunks and candidate car ids
      contextChunks = matches.map((m) => {
        // m already simplified by your utility: { id, score, ...meta }
        const { id, score, chunk_text, Brand, Model, Price, ID } = m;
        // try to extract numeric Car_ID either from a metadata field, or from record id like 'car_12'
        const fromIdMatch = (id || "").match(/car_(\d+)$/i);
        const carIdFromRec = fromIdMatch ? fromIdMatch[1] : (ID ?? null);

        return {
          id: id ?? null,
          score: score ?? null,
          chunk_text: chunk_text ?? m.chunk_text ?? "",
          brand: Brand ?? m.Brand ?? m.brand ?? null,
          model: Model ?? m.Model ?? m.model ?? null,
          price: Price ?? m.Price ?? null,
          car_id: carIdFromRec ?? null
        };
      });

      // list of unique numeric car ids
      carIds = Array.from(new Set(contextChunks.map(c => c.car_id).filter(Boolean))).map(id => {
        // Convert to numeric if numeric-like
        return /^\d+$/.test(String(id)) ? Number(id) : String(id);
      });

      console.log("[RAG] extracted carIds:", carIds);

      // --- Step 3: hydrate car details from Supabase using carIds (if any) ---
      if (carIds.length > 0) {
        try {
          const supabase = createSupabaseServerClient();
          const { data: carsData, error } = await supabase
            .from("Cars")
            .select("Car_ID,Brand,Model,Year,Price,Kilometers_Driven,Fuel_Type,Transmission,Owner_Type,Mileage,Engine,Power,Seats,Description")
            .in("Car_ID", carIds);

          if (error) {
            console.warn("[RAG] Supabase returned error:", error);
          } else if (Array.isArray(carsData)) {
            cars = carsData.map(c => ({
              ...c,
              imageUrl: composeImageUrl(c.Car_ID)
            }));
            console.log("[RAG] Hydrated cars count:", cars.length);
          }
        } catch (err) {
          console.error("[RAG] Supabase hydration error:", err);
        }
      }

      // --- Step 4: final OpenAI call including context (if any) ---
      if (contextChunks.length > 0) {
        const contextText = contextChunks
          .slice(0, 6) // keep context concise
          .map((c, i) => `-- Car ${i + 1} --\nBrand: ${c.brand ?? "N/A"}\nModel: ${c.model ?? "N/A"}\nPrice: ${c.price ?? "N/A"}\nInfo: ${c.chunk_text ?? ""}`)
          .join("\n\n");

        const finalInstruction = `Use the provided context (car data) to answer concisely. Provide short recommendation(s), one or two bullets each. If cars exist, mention up to 3 and include why each fits the user query. Keep it short.`;

        const finalResp = await generateOpenAIResponse(query, {
          model: "gpt-4o-mini",
          instructions: finalInstruction,
          messages: [
            { role: "developer", content: "You are a helpful automotive assistant. Use the context to recommend cars." },
            { role: "user", content: `User Query: ${query}\n\nContext:\n${contextText}` }
          ]
        });

        const finalText = extractOutputText(finalResp.fullResponse) || finalResp.text || "";
        finalAnswer = finalText || finalAnswer || "No answer from model.";
        console.log("[RAG] finalAnswer length:", finalAnswer.length);
      } else {
        finalAnswer = "I couldn't find matching cars in the database. Try a different query or be more specific.";
        console.log("[RAG] No contextChunks -> no final context to send to model.");
      }
    }

    // Return the structured payload to frontend
    return NextResponse.json({
      answer: finalAnswer,
      contextChunks,
      carIds,
      cars
    });

  } catch (err) {
    console.error("[RAG] ❌ Error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error", stack: process.env.NODE_ENV === "development" ? err?.stack : undefined },
      { status: 500 }
    );
  }
}
