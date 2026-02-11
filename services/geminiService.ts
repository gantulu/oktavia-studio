
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export async function generateProductImage(
  base64Image: string,
  mimeType: string,
  productTitle: string,
  userPrompt: string
): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Construct the structured prompt as per the user's specific requirements
  const structuredPrompt = `
    Objective: Create a high-quality product marketing image for "${productTitle}".
    
    Main Rules:
    1. The provided product image is the main reference. The product must remain clearly visible, identical in form, and identifiable as the main subject.
    2. Display the product title "${productTitle}" prominently above the product image in elegant, futuristic typography.
    3. Background: Create a smooth gradient transitioning from deep blue to starlight white.
    4. Motion: Add a dynamic "splash liquid" effect in the background to create motion, energy, and depth.
    5. Features: Automatically infer 3 key features from the product title "${productTitle}". Display each feature inside a modern floating card:
       - Card background: Gradient dark blue
       - Shadow: Minimalistic subtle shadow for depth
       - Position: Near the product image, arranged artistically, but not overlapping the main product.
    6. Quality: Ensure lighting, shadows, and reflections are hyper-realistic, enhancing the 3D look of the product.
    7. Overall style: Clean, futuristic, professional, high-end e-commerce marketing.
    
    Additional Context from User: ${userPrompt || 'Create a professional studio setup.'}
    
    Return the generated image.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: structuredPrompt
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}

/**
 * Utility to convert an image URL to a base64 string for the API.
 */
export async function urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const [meta, data] = result.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        resolve({ data, mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Direct fetch failed, returning placeholder or error info.");
    throw new Error("Could not load image. This might be due to CORS restrictions on the source image link.");
  }
}
