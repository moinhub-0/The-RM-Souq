import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const ProductRating = ({ productId, className = "" }: { productId: string, className?: string }) => {
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRatings = async () => {
      try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('productId', '==', productId));
        const snap = await getDocs(q);
        if (snap.empty) {
          if (isMounted) {
            setRating({ average: 0, count: 0 });
            setLoading(false);
          }
          return;
        }
        
        let sum = 0;
        snap.forEach(doc => sum += doc.data().rating);
        if (isMounted) {
          setRating({ average: sum / snap.size, count: snap.size });
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    fetchRatings();
    return () => { isMounted = false; };
  }, [productId]);

  if (loading || rating.count === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 text-xs font-bold text-gray-700 ${className}`}>
      <Star size={12} className="text-[#fbbf24]" fill="currentColor" />
      <span>{rating.average.toFixed(1)}</span>
      <span className="w-px h-3 bg-gray-300 mx-0.5"></span>
      <span className="text-gray-500">{rating.count}</span>
    </div>
  );
};
