import OpenAI from "openai";

export async function generateOpenAIResponse(input, options = {}) {
  const {
    model = "gpt-4o-mini",
    instructions = "You are a helpful automotive assistant.",
    messages = []
  } = options;

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY missing");
    }

    console.log("[OpenAI] Input:", input);
    console.log("[OpenAI] Messages:", messages);

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Use the correct OpenAI Responses API format from the docs
    const response = await openai.responses.create({
      model: model,
      instructions: instructions,
      input: messages.length > 0 ? messages : input
    });

    console.log("[OpenAI] Raw response:", JSON.stringify(response, null, 2));

    // Extract text from the response
    const outputText = response.output_text || 
      (response.output && Array.isArray(response.output) 
        ? response.output
            .map(item => item?.content?.map(c => c.type === "output_text" ? c.text : "").join(""))
            .join("")
        : "");

    console.log("[OpenAI] Extracted text:", outputText);

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
