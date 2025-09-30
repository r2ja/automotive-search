// src/app/api/rag/route.js
import { generateOpenAIResponse } from "@/lib/openaiUtil";
import { searchPinecone } from "@/lib/pineconeUtil";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

function composeImageUrl(carId, baseUrl = process.env.BUCKET_URL) {
  if (!baseUrl || !carId) return null;
  // Remove trailing slash and append car ID
  const base = baseUrl.replace(/\/$/, '');
  const imageUrl = `${base}/${carId}.jpg`;
  console.log("[composeImageUrl] Generated URL:", imageUrl);
  return imageUrl;
}

export async function POST(req) {
  const encoder = new TextEncoder();

  try {
    console.log("[RAG] ✅ Endpoint hit");

    const body = await req.json().catch(() => ({}));
    const query = (body?.query || "").toString().trim();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    console.log("[RAG] Request:", { query, msgsLength: messages.length });

    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check env vars
    if (!process.env.OPENAI_API_KEY || !process.env.PINECONE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API keys" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const NAMESPACE = process.env.PINECONE_NAMESPACE || "ns1";

    // Determine if we need to search (check for car-related keywords)
    const needsSearch = /find|show|recommend|list|suggest|under|budget|cheap|mileage|efficient|suv|sedan|hatchback|buy|best|looking|want|need/i.test(query);

    let cars = [];
    let contextText = "";

    // Search Pinecone if needed
    if (needsSearch) {
      console.log("[RAG] Searching Pinecone...");
      const pineconeRes = await searchPinecone(query, { topK: 8, namespace: NAMESPACE });
      const matches = Array.isArray(pineconeRes.matches) ? pineconeRes.matches : [];

      if (matches.length > 0) {
        // Extract car IDs
        const carIds = Array.from(
          new Set(
            matches.map(m => {
              const match = (m.id || "").match(/car_(\d+)$/i);
              return match ? Number(match[1]) : null;
            }).filter(Boolean)
          )
        );

        // Fetch car details from Supabase
        if (carIds.length > 0) {
          try {
            const supabase = createSupabaseServerClient();
            const { data: carsData } = await supabase
              .from("Cars")
              .select("Car_ID,Brand,Model,Year,Price,Fuel_Type,Transmission,Mileage,Description")
              .in("Car_ID", carIds)
              .limit(6);

            if (carsData) {
              cars = carsData.map(c => ({
                ...c,
                imageUrl: composeImageUrl(c.Car_ID)
              }));

              // Build context for OpenAI
              contextText = cars.map(c =>
                `${c.Brand} ${c.Model} (${c.Year}): ₹${c.Price}. ${c.Description || ''}`
              ).join('\n');

              console.log("[RAG] Found", cars.length, "cars");
            }
          } catch (err) {
            console.error("[RAG] Supabase error:", err);
          }
        }
      }
    }

    // Stream OpenAI response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Build system prompt
          const systemPrompt = cars.length > 0
            ? `You are a helpful automotive assistant. Based on the user's query, I've found ${cars.length} relevant cars in our database. Provide a brief, conversational response (2-3 sentences max) about what cars we found. Don't repeat car details - just give a friendly overview. The actual car cards will be shown separately below your message.`
            : `You are a helpful automotive assistant. Have a natural conversation with the user about cars. Be friendly and helpful.`;

          // Add context to last message if we have cars
          const chatMessages = [...messages];
          if (cars.length > 0 && contextText) {
            chatMessages.push({
              role: "user",
              content: `${query}\n\n[Available cars: ${contextText}]`
            });
          } else {
            chatMessages.push({ role: "user", content: query });
          }

          // Get streaming response from OpenAI
          const completion = await generateOpenAIResponse(query, {
            model: "gpt-4o-mini",
            systemMessage: systemPrompt,
            messages: chatMessages,
            stream: true
          });

          // Stream the response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: content })}\n\n`)
              );
            }
          }

          // Send car data at the end
          if (cars.length > 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ cars })}\n\n`)
            );
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error("[RAG] Stream error:", error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (err) {
    console.error("[RAG] ❌ Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
