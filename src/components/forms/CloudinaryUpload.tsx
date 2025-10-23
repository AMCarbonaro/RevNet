'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, FileText, Video, Music } from 'lucide-react';

interface CloudinaryUploadProps {
  onUploadComplete: (url: string, publicId: string) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  folder?: string;
  className?: string;
}

export default function CloudinaryUpload({
  onUploadComplete,
  onUploadError,
  maxFileSize = 10,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx'],
  folder = 'revolution-network',
  className = ''
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'revolution-network');
    formData.append('folder', folder);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      const errorMsg = `File size must be less than ${maxFileSize}MB`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Validate file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type || file.name.toLowerCase().endsWith(type);
    });

    if (!isValidType) {
      const errorMsg = `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadToCloudinary(file);
      onUploadComplete(result.url, result.publicId);
      setPreview(null);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      setPreview(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    if (fileType.startsWith('video/')) return <Video className="w-8 h-8" />;
    if (fileType.startsWith('audio/')) return <Music className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isUploading
            ? 'border-terminal-green bg-terminal-green/10'
            : 'border-terminal-cyan hover:border-terminal-green hover:bg-terminal-green/5'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-48 mx-auto rounded border border-terminal-green"
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 p-1 bg-black/80 border border-terminal-red rounded hover:bg-terminal-red hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 mx-auto text-terminal-cyan" />
            <div>
              <p className="text-terminal-green font-semibold">
                Drag and drop files here, or click to select
              </p>
              <p className="text-terminal-cyan text-sm mt-1">
                Max file size: {maxFileSize}MB
              </p>
              <p className="text-terminal-cyan text-xs mt-1">
                Supported: {acceptedTypes.join(', ')}
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={acceptedTypes.join(',')}
          className="hidden"
          disabled={isUploading}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-4 px-4 py-2 bg-terminal-green text-black rounded hover:bg-terminal-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? 'Uploading...' : 'Choose File'}
        </button>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-terminal-cyan">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-terminal-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-terminal-red/20 border border-terminal-red rounded text-terminal-red text-sm">
          {error}
        </div>
      )}

      {/* Upload Instructions */}
      <div className="text-xs text-terminal-cyan space-y-1">
        <p><strong>Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Images are automatically optimized for web</li>
          <li>Videos are transcoded for better compatibility</li>
          <li>Files are stored securely in the cloud</li>
          <li>You can upload multiple files by selecting them individually</li>
        </ul>
      </div>
    </div>
  );
}
