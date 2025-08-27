'use client';

import { useState, useRef } from 'react';
import { Camera, ImageIcon, X, Upload } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

export function ImageUpload({ 
  onImagesChange, 
  maxImages = 5,
  existingImages = []
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingImages);
  const [error, setError] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isCamera: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    
    // Check max images limit
    const totalImages = selectedFiles.length + existingImages.length + files.length;
    if (totalImages > maxImages) {
      setError(`最大${maxImages}枚まで追加できます`);
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    Array.from(files).forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルのみアップロード可能です');
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('画像サイズは10MB以下にしてください');
        return;
      }

      validFiles.push(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      newPreviewUrls.push(url);
    });

    if (validFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...validFiles];
      const updatedUrls = [...previewUrls, ...newPreviewUrls];
      
      setSelectedFiles(updatedFiles);
      setPreviewUrls(updatedUrls);
      onImagesChange(updatedFiles);
    }

    // Reset input value to allow selecting the same file again
    if (isCamera && cameraInputRef.current) {
      cameraInputRef.current.value = '';
    } else if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    // Check if it's a new file or existing image
    const isNewFile = index >= existingImages.length;
    
    if (isNewFile) {
      const fileIndex = index - existingImages.length;
      const newFiles = selectedFiles.filter((_, i) => i !== fileIndex);
      
      // Revoke the object URL to free memory
      URL.revokeObjectURL(previewUrls[index]);
      
      const newUrls = previewUrls.filter((_, i) => i !== index);
      
      setSelectedFiles(newFiles);
      setPreviewUrls(newUrls);
      onImagesChange(newFiles);
    } else {
      // Handle existing image removal if needed
      // For now, just remove from preview
      const newUrls = previewUrls.filter((_, i) => i !== index);
      setPreviewUrls(newUrls);
    }
  };

  const handleLibraryClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          type="button"
          onClick={handleLibraryClick}
          className="btn-secondary flex items-center justify-center space-x-3 py-4 border-2 border-dashed border-[var(--border-color)] hover:border-primary-300 transition-colors"
        >
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-primary" />
          </div>
          <span className="body-small font-medium">ライブラリから選択</span>
        </button>
        
        <button 
          type="button"
          onClick={handleCameraClick}
          className="btn-secondary flex items-center justify-center space-x-3 py-4 border-2 border-dashed border-[var(--border-color)] hover:border-primary-300 transition-colors"
        >
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Camera className="w-4 h-4 text-primary" />
          </div>
          <span className="body-small font-medium">カメラで撮影</span>
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e, false)}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e, true)}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {previewUrls.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="caption text-[var(--text-muted)]">
              {previewUrls.length}/{maxImages}枚
            </p>
            {selectedFiles.length > 0 && (
              <div className="flex items-center space-x-1 text-primary">
                <Upload className="w-4 h-4" />
                <span className="caption">{selectedFiles.length}枚の新しい画像</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square group">
                <div className="w-full h-full relative rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                </div>
                
                {/* Overlay with remove button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-white rounded-full p-2 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                
                {/* New badge for newly selected images */}
                {index >= existingImages.length && (
                  <div className="absolute top-1 right-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                    新規
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {previewUrls.length === 0 && (
        <p className="caption text-center text-[var(--text-muted)] py-4">
          最大{maxImages}枚まで画像を追加できます
        </p>
      )}
    </div>
  );
}