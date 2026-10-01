import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Universal media upload helper:
 * 1. Direct client-to-cloud upload to Firebase Storage (public CDN, instant rendering across all environments)
 * 2. Progress reporting for large media / videos
 * 3. Fast server upload fallback & client-side compression fallback
 */
export async function uploadMediaFile(
  file: File | Blob,
  folder = 'uploads',
  customFileName?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const originalName = file instanceof File ? file.name : 'media_file';
  const cleanName = (customFileName || originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${folder}/${timestamp}_${cleanName}`;
  const isVideo = file.type.startsWith('video/') || (file instanceof File && /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name));

  // 1. Primary: Direct Client Firebase Storage upload (works everywhere, zero serverless proxy required)
  if (storage) {
    try {
      const storageRef = ref(storage, storagePath);
      const mimeType = file.type || (isVideo ? 'video/mp4' : 'image/jpeg');

      if (onProgress) {
        return await new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, file, { contentType: mimeType });

          uploadTask.on(
            'state_changed',
            (snap) => {
              const pct = snap.totalBytes > 0 ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100) : 0;
              onProgress(pct);
            },
            (err) => reject(err),
            async () => {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            }
          );
        });
      } else {
        const snapshot = await uploadBytes(storageRef, file, { contentType: mimeType });
        const downloadUrl = await getDownloadURL(snapshot.ref);
        if (downloadUrl) return downloadUrl;
      }
    } catch (directStorageErr) {
      console.warn('Firebase Storage upload note, trying fallback:', directStorageErr);
    }
  }

  // 2. Secondary fallback: Server-side Cloudflare R2 / upload endpoint
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', cleanName);
    formData.append('folder', folder);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        return data.url;
      }
    }
  } catch (serverErr) {
    console.warn('Server upload fallback note:', serverErr);
  }

  // 3. Fallback for images: Compress image to lightweight base64 Data URI
  if (file.type.startsWith('image/')) {
    try {
      return await compressImageToBase64(file);
    } catch {
      // continue to reader
    }
  }

  // Final fallback: standard FileReader data URL
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

