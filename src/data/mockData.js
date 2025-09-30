// src/data/mockData.js
export const carRecommendations = [
  {
    id: 1,
    brand: "Toyota",
    model: "Camry",
    price: "$30,000",
    description: "Well-rated for safety, spacious, and reliable.",
    image: "C:/Users/ataul/Desktop/Automotive RAG/dataset/images/1.jpg"
  },
  {
    id: 2,
    brand: "Subaru",
    model: "Legacy",
    price: "$30,000",
    description: "Known for its standard all-wheel drive and excellent crash test ratings.",
    image: "C:/Users/ataul/Desktop/Automotive RAG/dataset/images/1.jpg"
  },
  {
    id: 3,
    brand: "Honda",
    model: "Accord",
    price: "$30,000",
    description: "Well-rated for safety, spacious, and reliable.",
    image: "C:/Users/ataul/Desktop/Automotive RAG/dataset/images/1.jpg"
  }
];

export const conversationFlows = {
  greetings: ["hello", "hi", "hey", "greetings"],
  buyIntent: ["yes", "buy", "want to buy", "looking for", "interested"],
  budgetKeywords: ["50", "50,000", "50k", "fifty thousand"],
  featureKeywords: ["mileage", "efficient", "fuel", "economy"],
  safetyKeywords: ["safety", "safe", "crash", "rating"]
};

export const botResponses = {
  greeting: "Hello! How can I assist you today? Are you looking for information about cars or something specific?",
  askType: "Great! What type of car are you looking for? Do you have a budget or any specific preferences in mind, like fuel type or features?",
  budgetResponse: "Great! With a budget of $50,000 for a used sedan, you have some excellent options. Do you prefer any particular brands or features, like advanced safety tech or a certain performance level?",
  mileageResponse: "Thanks for that! What's your budget for the used sedan? If you have preferences for specific features or brands, let me know!",
  safetyResponse: "Safety is crucial! Here are a few used sedans known for their safety features within your budget:",
  defaultResponse: "I understand you're looking for information about cars. Could you tell me more about what you're looking for? For example, your budget, preferred car type, or any specific features you need?",
  followUp: "Would you like more detailed information on any of these options?"
};