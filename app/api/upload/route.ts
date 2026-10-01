import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string || file?.name || `upload_${Date.now()}`;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cfToken = process.env.CLOUDFLARE_API_TOKEN;
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cfBucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const cfPublicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

    // Upload directly to Cloudflare R2
    if (cfToken && cfAccountId && cfBucket) {
      const bytes = await file.arrayBuffer();
      const objectKey = `${folder}/${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
      
      const r2Endpoint = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/r2/buckets/${cfBucket}/objects/${objectKey}`;
      
      const cfResponse = await fetch(r2Endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${cfToken}`,
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: bytes,
      });

      if (cfResponse.ok) {
        const isPrivateS3Url = cfPublicUrl?.includes('r2.cloudflarestorage.com');
        const publicUrl = (cfPublicUrl && !isPrivateS3Url)
          ? `${cfPublicUrl.replace(/\/$/, '')}/${objectKey}`
          : `/api/media/${objectKey}`;
        
        return NextResponse.json({ 
          success: true, 
          url: publicUrl,
          provider: 'cloudflare_r2',
          key: objectKey 
        });
      } else {
        const errorText = await cfResponse.text();
        console.error('Cloudflare R2 API upload error:', errorText);
      }
    }

    // Secondary Fallback: Return data URL
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ 
      success: true, 
      url: dataUrl,
      provider: 'local_fallback',
      message: 'Cloudflare upload fallback data URL generated.'
    });

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
