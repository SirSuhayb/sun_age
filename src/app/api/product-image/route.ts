import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const asin = searchParams.get('asin');
  
  if (!asin) {
    return NextResponse.json({ error: 'ASIN parameter is required' }, { status: 400 });
  }

  try {
    // Amazon product image URL format
    const imageUrl = `https://m.media-amazon.com/images/I/${asin}.jpg`;
    
    // Fetch the image to verify it exists
    const response = await fetch(imageUrl);
    
    if (response.ok) {
      return NextResponse.json({ 
        imageUrl,
        success: true 
      });
    } else {
      // Fallback to a placeholder if image doesn't exist
      return NextResponse.json({ 
        imageUrl: '/api/placeholder/400/400',
        success: false 
      });
    }
  } catch (error) {
    console.error('Error fetching product image:', error);
    return NextResponse.json({ 
      imageUrl: '/api/placeholder/400/400',
      success: false 
    });
  }
} 