import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { Heart, Star, ArrowLeft, Share2, Minus, Plus as PlusIcon, RotateCcw, Truck, ShieldCheck, Wallet, ChevronLeft, ChevronRight, Edit2, X } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { ProductCard } from '../components/ProductCard';

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
  const [quantity, setQuantity] = useState(1);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewText, setEditReviewText] = useState('');
  const [editRating, setEditRating] = useState(5);

  const relatedProducts = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 5);

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

  const handleToggleWishlist = (e?: React.MouseEvent, productId?: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user) {
      loginWithGoogle();
      return;
    }
    toggleWishlist(productId || product.id);
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

  const handleUpdateReview = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    if (!user || !editReviewText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        rating: editRating,
        text: editReviewText.trim()
      });
      
      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, rating: editRating, text: editReviewText.trim() } : r
      ));
      setEditingReviewId(null);
    } catch (error) {
      console.error("Error updating review", error);
      alert("Failed to update review. Please try again.");
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
      className="max-w-7xl mx-auto py-8 px-4"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-brand-green-700 hover:text-brand-green-900 mb-8 transition-colors">
        <ArrowLeft size={20} /> Back to Shop
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-brand-sand-100">
        {/* Left Side: Image Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="aspect-[4/5] sm:aspect-square rounded-[2.5rem] overflow-hidden bg-brand-sand-50 border border-brand-sand-100 shadow-sm relative group/main">
            {(() => {
              const currentMedia = activeImage || product.imageUrl;
              if (!currentMedia) return null;
              if (currentMedia.endsWith('.mp4')) {
                return <video src={currentMedia} autoPlay loop muted playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover/main:scale-110" />;
              }
              return (
                <img 
                  src={currentMedia} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/main:scale-110"
                />
              );
            })()}
          </div>
          
          {(product.additionalImages && product.additionalImages.length > 0) && (
            <div className="relative group/gallery">
              <div 
                id="thumbnail-container"
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-none items-center snap-x scroll-smooth px-2"
              >
               <button 
                  onClick={() => setActiveImage(product.imageUrl)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all snap-start ${(!activeImage || activeImage === product.imageUrl) ? 'border-brand-green-900 ring-4 ring-brand-green-50 shadow-lg' : 'border-brand-sand-100 opacity-60 hover:opacity-100'}`}
                >
                     {product.imageUrl?.endsWith('.mp4') ? (
                       <video src={product.imageUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                     ) : (
                       <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                     )}
                </button>
                {product.additionalImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all snap-start ${activeImage === img ? 'border-brand-green-900 ring-4 ring-brand-green-50 shadow-lg' : 'border-brand-sand-100 opacity-60 hover:opacity-100'}`}
                  >
                     {img.endsWith('.mp4') ? (
                       <video src={img} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                     ) : (
                       <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                     )}
                  </button>
                ))}
              </div>
              
              {/* Navigation Arrows */}
              <button 
                onClick={() => {
                  const el = document.getElementById('thumbnail-container');
                  if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 text-brand-green-900 opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10 border border-brand-sand-200 hover:bg-brand-sand-50 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('thumbnail-container');
                  if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 text-brand-green-900 opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10 border border-brand-sand-200 hover:bg-brand-sand-50 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </motion.div>
        
        {/* Right Side: Product Details & Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col h-full"
        >
          <div className="space-y-8 flex-grow">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-gold-600 px-3 py-1 bg-brand-gold-50 border border-brand-gold-100 rounded-full inline-block">Premium Collection</span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl text-brand-green-900 font-serif leading-[1.1]">{product.name}</h1>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    const shareData = { title: product.name, text: `Check out ${product.name} on The RM Souq!`, url: window.location.href };
                    if (navigator.share) navigator.share(shareData).catch(console.error);
                    else { navigator.clipboard.writeText(window.location.href); alert('Product link copied to clipboard!'); }
                  }}
                  className="p-3 rounded-full border border-brand-sand-200 bg-white text-gray-700 hover:bg-brand-sand-50 transition-all shadow-sm active:scale-95"
                  title="Share Product"
                >
                  <Share2 size={24} />
                </button>
                <button 
                  onClick={() => handleToggleWishlist(undefined, product.id)}
                  className={`p-3 rounded-full border border-brand-sand-200 transition-all shadow-sm active:scale-95 ${isWished ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-gray-400 hover:bg-brand-sand-50'}`}
                  title={isWished ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart size={24} fill={isWished ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="bg-brand-sand-50/50 border border-brand-sand-100 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-brand-green-800 opacity-60">Offer Price</span>
                  <span className="text-5xl font-bold text-brand-green-900">₹{product.price.toLocaleString()}</span>
                </div>
                
                {product.mrp && product.mrp > product.price && (
                  <div className="flex flex-col gap-1 border-l-2 border-brand-sand-200 pl-4">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">MRP:</span>
                       <span className="text-xl text-gray-400 line-through font-medium">₹{product.mrp.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black tracking-widest shadow-sm uppercase">
                        Save {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                      </span>
                      <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
                        (Save ₹{(product.mrp - product.price).toLocaleString()} off)
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 text-yellow-500 bg-yellow-50 ring-1 ring-yellow-200 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm h-fit">
                  <Star size={16} fill="currentColor" />
                  {averageRating} <span className="text-gray-400 font-medium ml-1">({reviews.length} reviews)</span>
                </div>
              )}
            </div>
            
            <div className="pros pros-lg prose-green max-w-none text-gray-600 leading-relaxed font-medium">
              <Markdown remarkPlugins={[remarkGfm]}>{product.description}</Markdown>
            </div>
            
            {product.descriptionImages && product.descriptionImages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {product.descriptionImages.map((mediaUrl, idx) => (
                  <div key={idx} className="rounded-[2rem] overflow-hidden shadow-sm border border-brand-sand-100 aspect-[4/5] sm:aspect-square group relative">
                    {mediaUrl.endsWith('.mp4') ? (
                      <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <img src={mediaUrl} alt={`Description Media ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4 py-8">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-brand-green-800 opacity-60 ml-4 color-[#1b4d3e]">QUANTITY</span>
                  <div className="flex items-center bg-white border border-brand-sand-300 rounded-full p-1.5 shadow-sm">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-brand-sand-50 rounded-full transition-colors text-brand-green-900 disabled:opacity-30 active:scale-90"
                      disabled={quantity <= 1}
                    >
                      <Minus size={20} />
                    </button>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 text-center font-bold text-xl text-brand-green-900 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-brand-sand-50 rounded-full transition-colors text-brand-green-900 active:scale-90"
                    >
                      <PlusIcon size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-grow w-full pt-6 sm:pt-6">
                  <button 
                    onClick={() => addToCart(product, quantity)}
                    className="w-full bg-[#0a3d1d] text-white py-5 rounded-full font-black text-xl hover:bg-[#062914] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex items-center justify-center uppercase tracking-widest"
                  >
                    Add to cart
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 ml-4 mt-2">
                <div className="text-xl font-bold text-brand-green-900">Total Amount: ₹{(product.price * quantity).toLocaleString()}</div>
                {quantity > 1 && (
                  <div className="text-[13px] text-brand-green-600 font-bold">* Free shipping applied</div>
                )}
              </div>
            </div>

            <div className="bg-[#0a3d1d] rounded-[2.5rem] p-10 grid grid-cols-2 md:grid-cols-4 gap-8 shadow-inner">
              <div className="flex flex-col items-center text-center gap-4 group/badge">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-green-900 shadow-lg group-hover/badge:scale-110 transition-transform">
                  <RotateCcw size={28} />
                </div>
                <span className="text-[10px] text-white font-black leading-tight tracking-[0.1em]">EASY RETURNS</span>
              </div>
              <div className="flex flex-col items-center text-center gap-4 group/badge">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-green-900 shadow-lg group-hover/badge:scale-110 transition-transform">
                  <Wallet size={28} />
                </div>
                <span className="text-[10px] text-white font-black leading-tight tracking-[0.1em]">COD AVAILABLE</span>
              </div>
              <div className="flex flex-col items-center text-center gap-4 group/badge">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-green-900 shadow-lg group-hover/badge:scale-110 transition-transform">
                  <Truck size={28} />
                </div>
                <span className="text-[10px] text-white font-black leading-tight tracking-[0.1em]">FAST DELIVERY</span>
              </div>
              <div className="flex flex-col items-center text-center gap-4 group/badge">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-green-900 shadow-lg group-hover/badge:scale-110 transition-transform">
                  <ShieldCheck size={28} />
                </div>
                <span className="text-[10px] text-white font-black leading-tight tracking-[0.1em]">SECURE PAYMENTS</span>
              </div>
            </div>

            {(product.highlightHeading || product.highlightContent) && (
              <div className="bg-brand-green-50/50 border border-brand-green-100 rounded-3xl p-8 space-y-4">
                {product.highlightHeading && (
                  <h3 className="font-serif font-bold text-brand-green-900 text-2xl">{product.highlightHeading}</h3>
                )}
                {product.highlightContent && (
                  <div className="prose prose-sm prose-green max-w-none text-brand-green-800 leading-relaxed font-medium">
                    <Markdown remarkPlugins={[remarkGfm]}>{product.highlightContent}</Markdown>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Product Description Full Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20"
      >
        <div className="mb-12">
          <h2 className="text-4xl text-brand-green-900 font-serif mb-6">Description</h2>
          <div className="h-px w-full bg-brand-sand-200" />
        </div>

        {product.descriptionImages && product.descriptionImages.length > 0 && (
          <div className="space-y-12">
            {product.descriptionImages.map((img, idx) => (
              <div key={idx} className="rounded-[2.5rem] overflow-hidden shadow-sm border border-brand-sand-100">
                <img src={img} alt={`Detail ${idx + 1}`} className="w-full h-auto" />
              </div>
            ))}
          </div>
        )}
      </motion.div>

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
              reviews.map((review) => {
                const isEditing = editingReviewId === review.id;
                
                return (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   key={review.id} 
                   className="bg-white p-6 rounded-2xl border border-brand-sand-100 shadow-sm relative group"
                 >
                   {isEditing ? (
                     <form onSubmit={(e) => handleUpdateReview(e, review.id)} className="space-y-4">
                       <div className="flex justify-between items-center mb-2">
                         <h4 className="font-semibold text-brand-green-900">Edit Review</h4>
                         <button 
                           type="button" 
                           onClick={() => setEditingReviewId(null)}
                           className="text-gray-400 hover:text-gray-600"
                         >
                           <X size={18} />
                         </button>
                       </div>
                       <div className="flex gap-2 mb-4">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <button
                             key={star}
                             type="button"
                             onClick={() => setEditRating(star)}
                             className="text-yellow-500 hover:scale-110 transition-transform"
                           >
                             <Star size={24} fill={editRating >= star ? "currentColor" : "none"} />
                           </button>
                         ))}
                       </div>
                       <textarea 
                         value={editReviewText}
                         onChange={(e) => setEditReviewText(e.target.value)}
                         required
                         rows={4} 
                         className="w-full p-3 bg-brand-sand-50 border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none resize-none"
                         placeholder="Update your review..."
                       />
                       <div className="flex gap-3 justify-end mt-4">
                         <button 
                           type="button"
                           onClick={() => setEditingReviewId(null)}
                           className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                         >
                           Cancel
                         </button>
                         <button 
                           type="submit"
                           disabled={isSubmitting || !editReviewText.trim()}
                           className="px-6 py-2 bg-brand-green-900 text-brand-gold-400 rounded-xl text-sm font-medium hover:bg-brand-green-800 disabled:opacity-50"
                         >
                           {isSubmitting ? "Saving..." : "Save Changes"}
                         </button>
                       </div>
                     </form>
                   ) : (
                     <>
                       {user?.uid === review.userId && (
                         <button 
                           onClick={() => {
                             setEditingReviewId(review.id);
                             setEditReviewText(review.text);
                             setEditRating(review.rating);
                           }}
                           className="absolute top-6 right-6 text-gray-400 hover:text-brand-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
                           title="Edit review"
                         >
                           <Edit2 size={16} />
                         </button>
                       )}
                       <div className="flex items-start justify-between mb-2">
                         <div>
                           <h4 className="font-semibold text-brand-green-900">{review.userName}</h4>
                           <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                         </div>
                         <div className="flex text-yellow-500 mr-6">
                           {[1, 2, 3, 4, 5].map((star) => (
                             <Star key={star} size={14} fill={review.rating >= star ? "currentColor" : "none"} className={review.rating >= star ? "" : "text-gray-300"} />
                           ))}
                         </div>
                       </div>
                       <p className="text-gray-700 text-sm">{review.text}</p>
                     </>
                   )}
                 </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-24 pt-20 border-t border-brand-sand-200 relative"
        >
          {/* Subtle background accent */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-brand-sand-100/30 blur-3xl rounded-full -z-10 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold-600 block">Curated for you</span>
              <h2 className="text-4xl text-brand-green-900 font-serif leading-tight">Similar Treasures</h2>
            </div>
            <Link 
              to="/" 
              className="group flex items-center gap-2 text-brand-green-700 hover:text-brand-green-900 font-bold transition-all text-sm uppercase tracking-wider"
            >
              <span>Explore Collection</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {relatedProducts.map((p, index) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                index={index} 
                isWished={profile?.wishlist?.includes(p.id) || false}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
