/**
 * Cloudflare R2 Media Upload Helper
 * Handles images, PDFs, videos, and documents directly to Cloudflare R2
 */
export async function uploadMediaFile(
  file: File | Blob,
  folder = 'uploads',
  customFileName?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const originalName = file instanceof File ? file.name : 'media_file';
  const cleanName = (customFileName || originalName).replace(/[^a-zA-Z0-9._-]/g, '_');

  // 1. Primary: Direct upload to Cloudflare R2 endpoint (/api/upload)
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', cleanName);
    formData.append('folder', folder);

    if (onProgress) onProgress(30);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (onProgress) onProgress(80);

    if (res.ok) {
      const data = await res.json();
      if (onProgress) onProgress(100);
      if (data.url) {
        return data.url;
      }
    }
  } catch (cfErr) {
    console.warn('Cloudflare R2 upload note:', cfErr);
  }

  // 2. Client-side fallback for images: Base64 data URL
  if (file.type.startsWith('image/')) {
    try {
      return await compressImageToBase64(file);
    } catch {
      // continue to reader
    }
  }

  // 3. Final fallback: standard FileReader data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image file in-browser to a lightweight base64 JPEG/WebP
 */
export async function compressImageToBase64(file: File | Blob, maxWidth = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Ensures any stored Cloudflare R2 S3-endpoint URL or media path is seamlessly mapped to a displayable URL
 */
export function getMediaDisplayUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http')) {
    if (url.includes('.r2.cloudflarestorage.com/')) {
      const parts = url.split('.r2.cloudflarestorage.com/');
      if (parts[1]) {
        const pathWithBucket = parts[1];
        const slashIndex = pathWithBucket.indexOf('/');
        const cleanPath = slashIndex !== -1 ? pathWithBucket.substring(slashIndex + 1) : pathWithBucket;
        return `/api/media/${cleanPath}`;
      }
    }
    return url;
  }
  return url;
}

