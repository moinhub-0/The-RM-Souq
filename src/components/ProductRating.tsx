import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProductRatingProps {
  productId: string;
  className?: string;
}

export const ProductRating: React.FC<ProductRatingProps> = ({ productId, className = '' }) => {
  const [rating, setRating] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const q = query(collection(db, 'reviews'), where('productId', '==', productId));
        const snap = await getDocs(q);
        if (snap.empty) {
          setRating(0);
          setCount(0);
        } else {
          let total = 0;
          snap.forEach(doc => total += doc.data().rating || 0);
          setRating(total / snap.size);
          setCount(snap.size);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRating();
  }, [productId]);

  if (loading || count === 0) return <div className={`h-4 ${className}`} />;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex text-yellow-500">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={12} fill={rating >= s ? "currentColor" : "none"} className={rating >= s ? "" : "text-gray-200"} />
        ))}
      </div>
      <span className="text-[10px] font-bold text-gray-400">({count})</span>
    </div>
  );
};
