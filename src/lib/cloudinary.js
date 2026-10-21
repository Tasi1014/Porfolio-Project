/**
 * cloudinary.js — Cloudinary unsigned upload helpers
 * Uses the Cloudinary Upload API (no SDK needed — just fetch)
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

/**
 * Upload a file to Cloudinary.
 * @param {File} file - The file to upload (image or video)
 * @param {Function} onProgress - Optional callback (0-100)
 * @returns {Promise<{url: string, publicId: string, resourceType: string}>}
 */
export async function uploadToCloudinary(file, onProgress) {
  const resourceType = file.type.startsWith("video/") ? "video" : "image";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "portfolio");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          resourceType: data.resource_type,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));

    xhr.open("POST", `${UPLOAD_URL.replace("/upload", `/${resourceType}/upload`)}`);
    xhr.send(formData);
  });
}
