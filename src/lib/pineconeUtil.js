// lib/pineconeUtil.js
import { Pinecone } from "@pinecone-database/pinecone";

export async function searchPinecone(query, options = {}) {
  const {
    topK = 5,
    fields = ["chunk_text", "Brand", "Model", "Price", "ID"],
    namespace = process.env.PINECONE_NAMESPACE || "ns1",
  } = options;

  try {
    const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
    const PINECONE_HOST_URL = process.env.PINECONE_HOST_URL;
    const INDEX_NAME = process.env.PINECONE_INDEX_NAME || "automotive";

    if (!PINECONE_API_KEY || !PINECONE_HOST_URL) {
      throw new Error("Pinecone credentials missing");
    }

    // init client and index
    const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
    const index = pc.index(INDEX_NAME, PINECONE_HOST_URL);
    const nsIndex = index.namespace(namespace); // ensure requests target the namespace

    // Build the SDK-friendly params (camelCase, inputs object)
    const params = {
      query: {
        topK,                   // camelCase as expected by the JS SDK
        inputs: { text: query } // integrated text search via inputs
      },
      fields
    };

    // DEBUG - log exact params we'll pass to the SDK
    console.log("[Pinecone] Calling namespace.searchRecords with params:");
    console.log(JSON.stringify(params, null, 2));

    // call the namespace-scoped searchRecords
    const searchResponse = await nsIndex.searchRecords(params);

    console.log("[Pinecone] Raw response:", JSON.stringify(searchResponse, null, 2));

    const matches = searchResponse?.result?.hits ?? [];

    const simplified = matches.map((m) => {
      const id = m._id || m.id || "";
      const score = m._score ?? m.score ?? 0;
      const meta = m.fields || m.metadata || {};
      return { id, score, ...meta };
    });
    

    console.log("[Pinecone] Matches found:", simplified.length);
    if (simplified.length) console.table(simplified);

    return { success: true, matches: simplified, count: simplified.length };
  } catch (error) {
    console.error("[Pinecone] Error:", error);
    return {
      success: false,
      error: typeof error === "string" ? error : (error?.message || JSON.stringify(error)),
      matches: [],
      count: 0
    };
  }
}
