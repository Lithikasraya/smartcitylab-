import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Universal media upload helper:
 * 1. Attempts direct upload to Firebase Storage
 * 2. Falls back to API upload route (/api/upload for Cloudflare R2 / server)
 * 3. Client-side compressed data URI fallback to guarantee zero broken uploads
 */
export async function uploadMediaFile(
  file: File | Blob,
  folder = 'uploads',
  customFileName?: string
): Promise<string> {
  const originalName = file instanceof File ? file.name : 'media_file';
  const cleanName = (customFileName || originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${folder}/${timestamp}_${cleanName}`;

  // 1. Try Firebase Storage directly
  try {
    if (storage) {
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || 'application/octet-stream',
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      if (downloadUrl) {
        return downloadUrl;
      }
    }
  } catch (firebaseErr) {
    console.warn('Firebase Storage upload note, trying fallback endpoint:', firebaseErr);
  }

  // 2. Try Server / Cloudflare R2 upload endpoint
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', cleanName);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        return data.url;
      }
    }
  } catch (serverErr) {
    console.warn('Server upload endpoint note, trying compressed client fallback:', serverErr);
  }

  // 3. Fallback: Compress image to lightweight Base64/WebP
  if (file.type.startsWith('image/')) {
    try {
      return await compressImageToBase64(file);
    } catch {
      // ignore
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
