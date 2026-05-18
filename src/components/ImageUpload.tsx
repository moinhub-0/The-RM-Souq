import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onSuccess: (url: string) => void;
  currentImage?: string;
  className?: string;
  folder?: string;
}

export default function ImageUpload({ onSuccess, currentImage, className = '', folder = 'uploads' }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{url: string, isVideo: boolean} | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview({ url: objectUrl, isVideo: file.type.includes('video') });

    setLoading(true);
    setError('');
    setProgress(0);

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        }, 
        (error) => {
          console.error(error);
          setError('Failed to upload image: ' + error.message);
          setLoading(false);
          setPreview(null);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onSuccess(downloadURL);
          setLoading(false);
          setPreview(null);
        }
      );
    } catch (err: any) {
      console.error(err);
      setError('An error occurred during upload.');
      setLoading(false);
      setPreview(null);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden group h-32 flex items-center justify-center">
        <input 
           type="file" 
           accept="image/*,video/mp4" 
           onChange={handleUpload} 
           disabled={loading}
           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
        />
        
        {loading && preview ? (
          <div className="absolute inset-0 w-full h-full">
            {preview.isVideo ? (
              <video src={preview.url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50" />
            ) : (
              <img src={preview.url} alt="Uploading..." className="w-full h-full object-cover opacity-50" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
               <Loader2 className="w-8 h-8 text-white animate-spin mb-2 drop-shadow-md" />
               <div className="text-xs font-bold text-white uppercase tracking-wider drop-shadow-md">{Math.round(progress)}%</div>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center p-4">
            <Loader2 className="w-8 h-8 text-[#b48d3d] animate-spin mx-auto mb-2" />
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{Math.round(progress)}% Uploading...</div>
          </div>
        ) : currentImage ? (
           <div className="absolute inset-0 w-full h-full">
             {currentImage.endsWith('.mp4') ? (
               <video src={currentImage} autoPlay loop muted playsInline className="w-full h-full object-cover" />
             ) : (
               <img src={currentImage} alt="Uploaded" className="w-full h-full object-cover" />
             )}
             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <UploadCloud className="w-8 h-8 mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Change File</span>
             </div>
           </div>
        ) : (
          <div className="text-center p-4">
            <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-[#b48d3d] transition-colors" />
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Click or Drag to Upload</div>
            <div className="text-[10px] text-gray-400 mt-1">Supports images & .mp4</div>
          </div>
        )}
      </div>
      {error && <div className="text-xs text-red-500">{error}</div>}
      {currentImage && !loading && !error && (
         <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-wider">
           <CheckCircle2 size={12} /> File Uploaded
         </div>
      )}
    </div>
  );
}
