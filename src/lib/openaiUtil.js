import OpenAI from "openai";

export async function generateOpenAIResponse(input, options = {}) {
  const {
    model = "gpt-4o-mini",
    systemMessage = "You are a helpful automotive assistant.",
    messages = [],
    stream = false
  } = options;

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY missing");
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Build messages array properly
    const chatMessages = [
      { role: "system", content: systemMessage },
      ...messages
    ];

    console.log("[OpenAI] Chat messages:", JSON.stringify(chatMessages, null, 2));

    // Use the correct Chat Completions API
    const response = await openai.chat.completions.create({
      model: model,
      messages: chatMessages,
      stream: stream,
      temperature: 0.7,
    });

    // If streaming, return the stream directly
    if (stream) {
      return response;
    }

    // Extract text from non-streaming response
    const outputText = response.choices?.[0]?.message?.content || "";

    console.log("[OpenAI] Response text:", outputText.substring(0, 200));

    return {
      success: true,
      text: outputText,
      fullResponse: response
    };

  } catch (error) {
    console.error("[OpenAI] Error:", error);
    return {
      success: false,
      error: error.message,
      text: "",
      fullResponse: null
    };
  }
}
