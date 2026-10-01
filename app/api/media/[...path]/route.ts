import { NextRequest, NextResponse } from 'next/server';

function getMimeType(filePath: string, defaultType = 'application/octet-stream'): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp4': return 'video/mp4';
    case 'webm': return 'video/webm';
    case 'mov': return 'video/quicktime';
    case 'mkv': return 'video/x-matroska';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'pdf': return 'application/pdf';
    default: return defaultType;
  }
}

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

    const reqHeaders: Record<string, string> = {
      Authorization: `Bearer ${cfToken}`,
    };

    const rangeHeader = req.headers.get('range');
    if (rangeHeader) {
      reqHeaders['Range'] = rangeHeader;
    }

    const r2Response = await fetch(r2Endpoint, {
      method: 'GET',
      headers: reqHeaders,
    });

    if (!r2Response.ok) {
      return new NextResponse('Media not found in Cloudflare R2', { status: r2Response.status });
    }

    const rawContentType = r2Response.headers.get('Content-Type') || '';
    const contentType = rawContentType && rawContentType !== 'application/octet-stream' && rawContentType !== 'binary/octet-stream'
      ? rawContentType
      : getMimeType(objectPath, rawContentType || 'application/octet-stream');

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');

    const contentRange = r2Response.headers.get('Content-Range');
    if (contentRange) responseHeaders.set('Content-Range', contentRange);

    const contentLength = r2Response.headers.get('Content-Length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);

    const body = await r2Response.arrayBuffer();

    return new NextResponse(body, {
      status: r2Response.status === 206 ? 206 : 200,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return new NextResponse(error.message || 'Media stream failed', { status: 500 });
  }
}
