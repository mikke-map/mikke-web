import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload an image to Firebase Storage
 * @param file - The image file to upload
 * @param spotId - The ID of the spot this image belongs to
 * @returns The download URL of the uploaded image
 */
export async function uploadSpotImage(file: File, spotId: string): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('ファイルは画像である必要があります');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('画像サイズは10MB以下である必要があります');
  }

  // Generate a unique filename
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `spots/${spotId}/${fileName}`;

  // Create a reference to the file location
  const storageRef = ref(storage, filePath);

  try {
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        spotId,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('画像のアップロードに失敗しました');
  }
}

/**
 * Upload multiple images to Firebase Storage
 * @param files - Array of image files to upload
 * @param spotId - The ID of the spot these images belong to
 * @returns Array of download URLs
 */
export async function uploadSpotImages(files: File[], spotId: string): Promise<string[]> {
  const uploadPromises = files.map(file => uploadSpotImage(file, spotId));
  
  try {
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error('画像のアップロードに失敗しました');
  }
}

/**
 * Delete an image from Firebase Storage
 * @param imageUrl - The URL of the image to delete
 */
export async function deleteSpotImage(imageUrl: string): Promise<void> {
  try {
    // Extract the file path from the download URL
    // Firebase Storage URLs contain the path after '/o/'
    const matches = imageUrl.match(/\/o\/(.+?)\?/);
    if (!matches || !matches[1]) {
      throw new Error('Invalid image URL');
    }
    
    const filePath = decodeURIComponent(matches[1]);
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('画像の削除に失敗しました');
  }
}

/**
 * Delete all images for a spot
 * @param imageUrls - Array of image URLs to delete
 */
export async function deleteSpotImages(imageUrls: string[]): Promise<void> {
  const deletePromises = imageUrls.map(url => deleteSpotImage(url));
  
  try {
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    // Continue even if some deletions fail
  }
}

/**
 * Generate a thumbnail URL from an image URL (if using Firebase Extensions)
 * This assumes you have the Resize Images extension installed
 * @param imageUrl - The original image URL
 * @param size - The thumbnail size (e.g., '200x200', '400x400')
 * @returns The thumbnail URL
 */
export function getThumbnailUrl(imageUrl: string, size: string = '200x200'): string {
  // If using Firebase Extensions for image resizing, thumbnails are typically stored
  // in a 'thumbs' subfolder with size appended to the filename
  // For now, return the original URL as we don't have the extension set up
  return imageUrl;
}