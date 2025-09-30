import { NextResponse } from "next/server";

// Test image URL composition and fallback strategy
function composeImageUrl(carId, baseUrl = process.env.BUCKET_URL) {
  if (!baseUrl) return null;
  // Remove trailing filename if present, keep the base path
  const base = baseUrl.replace(/\/[^\/]*\.(jpg|png|jpeg)$/i, '');
  return `${base}/${carId}.jpg`; // Default to .jpg first
}

async function testImageExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function findWorkingImageUrl(carId, baseUrl = process.env.BUCKET_URL) {
  if (!baseUrl) return null;
  
  const base = baseUrl.replace(/\/[^\/]*\.(jpg|png|jpeg)$/i, '');
  const extensions = ['jpg', 'png', 'jpeg'];
  
  for (const ext of extensions) {
    const url = `${base}/${carId}.${ext}`;
    if (await testImageExists(url)) {
      return { url, extension: ext, found: true };
    }
  }
  
  return { url: `${base}/${carId}.jpg`, extension: 'jpg', found: false };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const carId = searchParams.get('id') || '1'; // Test with ID 1 by default
    
    const baseUrl = process.env.BUCKET_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: "BUCKET_URL not set" }, { status: 500 });
    }
    
    // Test the fallback strategy
    const result = await findWorkingImageUrl(carId, baseUrl);
    
    return NextResponse.json({
      carId,
      baseUrl,
      result,
      testUrls: {
        jpg: `${baseUrl.replace(/\/[^\/]*\.(jpg|png|jpeg)$/i, '')}/${carId}.jpg`,
        png: `${baseUrl.replace(/\/[^\/]*\.(jpg|png|jpeg)$/i, '')}/${carId}.png`
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
