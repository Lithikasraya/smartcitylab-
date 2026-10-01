/**
 * Cloudflare Integration Helper
 * Supports Cloudflare R2 object storage & Cloudflare Images / API calls.
 */

export interface CloudflareConfig {
  accountId?: string;
  apiToken?: string;
  r2BucketName?: string;
  r2PublicUrl?: string;
}

export const cloudflareConfig: CloudflareConfig = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
  r2BucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  r2PublicUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-r2.smartcitylab.kiet.edu',
};

/**
 * Upload an image or file buffer to Cloudflare R2 / Images
 */
export async function uploadToCloudflareR2(
  file: File | Blob, 
  fileName: string,
  folder = 'uploads'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);
  formData.append('folder', folder);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to upload to Cloudflare storage');
  }

  const data = await res.json();
  return data.url;
}
