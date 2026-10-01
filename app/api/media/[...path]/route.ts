import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const objectPath = params.path ? params.path.join('/') : '';
    if (!objectPath) {
      return new NextResponse('Media path missing', { status: 400 });
    }

    const cfToken = process.env.CLOUDFLARE_API_TOKEN;
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cfBucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;

    if (!cfToken || !cfAccountId || !cfBucket) {
      return new NextResponse('Cloudflare R2 configuration missing', { status: 500 });
    }

    const r2Endpoint = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/r2/buckets/${cfBucket}/objects/${objectPath}`;

    const r2Response = await fetch(r2Endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cfToken}`,
      },
    });

    if (!r2Response.ok) {
      return new NextResponse('Media not found in Cloudflare R2', { status: r2Response.status });
    }

    const contentType = r2Response.headers.get('Content-Type') || 'application/octet-stream';
    const body = await r2Response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return new NextResponse(error.message || 'Media stream failed', { status: 500 });
  }
}
