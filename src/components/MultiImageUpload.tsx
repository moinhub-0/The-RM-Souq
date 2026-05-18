import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { UploadCloud, CheckCircle2, Loader2, X } from 'lucide-react';

interface MultiImageUploadProps {
  onSuccess: (urls: string[]) => void;
  currentImages?: string[];
  className?: string;
  folder?: string;
}

export default function MultiImageUpload({ onSuccess, currentImages = [], className = '', folder = 'uploads' }: MultiImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState<{url: string, isVideo: boolean}[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      isVideo: file.type.includes('video')
    }));
    setPreviews(newPreviews);

    setLoading(true);
    setError('');
    setProgress(0);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const storageRef = ref(storage, `${folder}/${fileName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const p = ((i + (snapshot.bytesTransferred / snapshot.totalBytes)) / files.length) * 100;
              setProgress(p);
            }, 
            (error) => reject(error), 
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(downloadURL);
              resolve();
            }
          );
        });
      }

      onSuccess([...currentImages, ...uploadedUrls]);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred during upload: ' + err.message);
    } finally {
      setLoading(false);
      setPreviews([]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = currentImages.filter((_, idx) => idx !== indexToRemove);
    onSuccess(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {(currentImages.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {currentImages.map((url, idx) => (
            <div key={`current-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
              {url.endsWith('.mp4') ? (
                <video src={url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button" 
                  onClick={() => removeImage(idx)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-md transform hover:scale-110 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {loading && previews.map((preview, idx) => (
            <div key={`preview-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
              {preview.isVideo ? (
                <video src={preview.url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50" />
              ) : (
                <img src={preview.url} alt={`Preview ${idx}`} className="w-full h-full object-cover opacity-50" />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                <Loader2 className="w-6 h-6 text-white animate-spin mb-1 drop-shadow-md" />
                <div className="text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-md">{Math.round(progress)}%</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden group h-32 flex items-center justify-center">
        <input 
           type="file" 
           accept="image/*,video/mp4" 
           multiple
           onChange={handleUpload} 
           disabled={loading}
           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
        />
        
        {loading ? (
          <div className="text-center p-4">
            <Loader2 className="w-8 h-8 text-[#b48d3d] animate-spin mx-auto mb-2" />
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Uploading Files...</div>
          </div>
        ) : (
          <div className="text-center p-4">
            <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-[#b48d3d] transition-colors" />
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Click or Drag to Upload Files</div>
            <div className="text-[10px] text-gray-400 mt-1">Supports multiple images & .mp4</div>
          </div>
        )}
      </div>
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );
}
