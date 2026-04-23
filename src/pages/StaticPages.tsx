import React from 'react';

export default function StaticPages({ page }: { page: 'about' | 'contact' }) {
  if (page === 'about') {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-6">
        <h1 className="text-4xl font-serif text-brand-green-900 mb-6">About The RM Souq</h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
          Welcome to The RM Souq, your trusted destination for authentic Sunnah and Halal products. 
          We specialize in sourcing the finest quality premium dates, bringing the rich traditions and 
          health benefits of the Middle East directly to your door.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
          Our mission is to provide products that not only nourish the body but also honor our 
          traditions, ensuring absolute purity, quality, and excellence in every bite.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-6">
      <h1 className="text-4xl font-serif text-brand-green-900 mb-6">Contact Us</h1>
      <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
        We would love to hear from you! Whether you have questions about our premium dates 
        or need help with your order.
      </p>
      
      <div className="bg-white border border-brand-sand-200 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-4 text-brand-green-900">
            <div className="bg-brand-sand-100 p-3 rounded-full">📞</div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">WhatsApp / Call</p>
              <p className="font-semibold text-lg">+91 7853903438</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-brand-green-900">
            <div className="bg-brand-sand-100 p-3 rounded-full">✉️</div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">Email</p>
              <p className="font-semibold text-lg">moincomp06@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
