import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { Heart, Star, ArrowLeft } from 'lucide-react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: number;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { products, loadingProducts } = useProducts();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  const { user, profile, toggleWishlist, loginWithGoogle } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!product) {
        setLoadingReviews(false);
        return;
    }
    
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'), 
          where('productId', '==', product.id)
        );
        const querySnapshot = await getDocs(q);
        const fetchedReviews: Review[] = [];
        querySnapshot.forEach((doc) => {
          fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
        });
        
        // Sort manually since we only indexed productId
        fetchedReviews.sort((a, b) => b.createdAt - a.createdAt);
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews", error);
      } finally {
        setLoadingReviews(false);
      }
    };
    
    fetchReviews();
  }, [product]);

  if (loadingProducts) {
    return <div className="text-center py-24 text-gray-500">Loading product...</div>;
  }

  if (!product) {
    return <div className="text-center py-24 text-2xl">Product not found.</div>;
  }

  const isWished = profile?.wishlist?.includes(product.id) || false;

  const handleToggleWishlist = () => {
    if (!user) {
      loginWithGoogle();
      return;
    }
    toggleWishlist(product.id);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newReview = {
        productId: product.id,
        userId: user.uid,
        userName: profile?.name || user.displayName || 'Customer',
        rating,
        text: reviewText.trim(),
        createdAt: Date.now()
      };
      
      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      setReviews([{ id: docRef.id, ...newReview }, ...reviews]);
      setReviewText('');
      setRating(5);
    } catch (error) {
      console.error("Error adding review", error);
      alert("Failed to add review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : '0';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto py-8"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-brand-green-700 hover:text-brand-green-900 mb-8 transition-colors">
        <ArrowLeft size={20} /> Back to Shop
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-brand-sand-100">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-4"
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-sand-50">
            <img src={activeImage || product.imageUrl || undefined} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.additionalImages && product.additionalImages.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setActiveImage(product.imageUrl)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${(!activeImage || activeImage === product.imageUrl) ? 'border-brand-green-900' : 'border-transparent'}`}
              >
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              </button>
              {product.additionalImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${activeImage === img ? 'border-brand-green-900' : 'border-transparent'}`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-8 flex flex-col justify-center"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-sm font-semibold tracking-widest uppercase text-brand-gold-600">{product.category}</p>
                  {product.weight && (
                     <span className="text-xs font-bold text-brand-sand-300 bg-brand-sand-50 px-2 py-0.5 rounded-md border border-brand-sand-100">
                       {product.weight}
                     </span>
                  )}
                </div>
                <h1 className="text-4xl sm:text-5xl mb-4 text-brand-green-900">{product.name}</h1>
              </div>
              <button 
                onClick={handleToggleWishlist}
                className={`p-3 rounded-full border border-brand-sand-200 transition-colors ${isWished ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-gray-400 hover:text-red-500'}`}
                title={isWished ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={24} fill={isWished ? "currentColor" : "none"} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-brand-green-800">â¹. {product.price.toLocaleString()}</span>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium">
                  <Star size={16} fill="currentColor" />
                  {averageRating} <span className="text-gray-500">({reviews.length} reviews)</span>
                </div>
              )}
            </div>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {product.descriptionImages && product.descriptionImages.length > 0 && (
              <div className="space-y-4 pt-4">
                {product.descriptionImages.map((img, idx) => (
                  <img key={idx} src={img} alt={`Description ${idx + 1}`} className="w-full rounded-2xl shadow-sm border border-brand-sand-100" />
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-brand-sand-50 border border-brand-sand-200 rounded-xl p-4 flex items-start gap-4">
            <div className="bg-brand-gold-100 p-2 rounded-full text-brand-gold-600 shrink-0 mt-1">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
            </div>
            <div>
              <h3 className="font-semibold text-brand-green-900">Make it a Gift! 🎁</h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">Want to send this to a loved one? Add to cart and select the <strong>gift option</strong> at checkout for elegant packaging.</p>
            </div>
          </div>

          {(product.highlightHeading || product.highlightContent) && (
            <div className="bg-brand-green-50 border border-brand-green-200 rounded-xl p-6 space-y-4">
              {product.highlightHeading && (
                <h3 className="font-serif font-semibold text-brand-green-900 text-lg mb-2">{product.highlightHeading}</h3>
              )}
              {product.highlightContent && (
                <div className="prose prose-sm prose-green max-w-none text-brand-green-800">
                  <Markdown remarkPlugins={[remarkGfm]}>{product.highlightContent}</Markdown>
                </div>
              )}
            </div>
          )}

          {/* Legacy hardcoded fallback for Talbina until data is migrated */}
          {(!product.highlightHeading && !product.highlightContent) && product.name.toLowerCase().includes('talbina') && (
            <div className="bg-brand-green-50 border border-brand-green-200 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="font-serif font-semibold text-brand-green-900 text-lg mb-2">Prophetic Superfood Health Benefits</h3>
                <ul className="list-disc list-inside text-sm text-brand-green-800 space-y-1">
                  <li><strong>Boosts energy</strong> & stamina throughout the day</li>
                  <li><strong>Aids digestion</strong> & soothes the stomach</li>
                  <li><strong>Reduces anxiety</strong> & stress to calm the mind</li>
                  <li><strong>High in fiber</strong> & essential minerals</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-brand-green-200/60">
                <h3 className="font-serif font-semibold text-brand-green-900 text-lg mb-2">3-Step Easy Recipe Guide</h3>
                <ol className="list-decimal list-inside text-sm text-brand-green-800 space-y-2">
                  <li><strong>Mix:</strong> Stir 2-3 tablespoons with a glass of milk or water.</li>
                  <li><strong>Cook:</strong> Simmer on low heat for 5-7 minutes, stirring continuously until thickened.</li>
                  <li><strong>Sweeten:</strong> Add pure honey or chopped dates to match your taste.</li>
                </ol>
              </div>
              <div className="pt-2 text-[10px] text-brand-green-700/60 font-medium">
                Keywords: Best Talbina in India, Buy Ruhani Talbina Online, Prophetic Medicine Food
              </div>
            </div>
          )}

          <button 
            onClick={() => addToCart(product)}
            className="w-full bg-brand-green-900 text-brand-gold-400 py-4 rounded-xl font-semibold hover:bg-brand-green-800 transition-colors text-lg shadow-md hover:shadow-lg"
          >
            Add to Cart
          </button>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mt-16"
      >
        <h2 className="text-3xl mb-8 border-b border-brand-sand-200 pb-4">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Add Review Form */}
          <div className="lg:col-span-1 border border-brand-sand-200 p-6 rounded-2xl bg-white h-fit">
            <h3 className="text-xl font-semibold mb-4 text-brand-green-900">Write a Review</h3>
            {!user ? (
              <div className="space-y-4">
                <p className="text-gray-600">Please log in to share your experience with this product.</p>
                <button onClick={loginWithGoogle} className="w-full border border-brand-green-900 text-brand-green-900 py-2 rounded-lg font-medium hover:bg-brand-sand-50 transition-colors">
                  Log In
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea 
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    rows={4} 
                    className="w-full p-3 bg-brand-sand-50 border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none resize-none"
                    placeholder="What did you think of this product?"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting || !reviewText.trim()}
                  className="w-full bg-brand-green-900 text-brand-gold-400 py-3 rounded-xl font-medium hover:bg-brand-green-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
          
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {loadingReviews ? (
              <div className="text-gray-500">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-brand-sand-200">
                <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={review.id} 
                  className="bg-white p-6 rounded-2xl border border-brand-sand-100 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-brand-green-900">{review.userName}</h4>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} fill={review.rating >= star ? "currentColor" : "none"} className={review.rating >= star ? "" : "text-gray-300"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{review.text}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
