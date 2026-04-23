import { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  currency: string;
  isFeatured?: boolean;
}

export const INITIAL_SHOP_PRODUCTS: Product[] = [
  {
    id: "p_ajwa_1kg",
    name: "Premium Ajwa Dates",
    description: "Authentic, soft, and naturally sweet Ajwa dates from Al Madinah. Known for their unique texture and numerous health benefits.",
    price: 1850,
    imageUrl: "https://images.unsplash.com/photo-1594834749740-74b3efe45e43?auto=format&fit=crop&w=800&q=80",
    category: "Dates",
    currency: "INR",
    isFeatured: true
  },
  {
    id: "p_medjool_1kg",
    name: "Royal Medjool Dates",
    description: "The 'King of Dates'. Large, plump, and incredibly sweet with a rich caramel-like flavor. Perfect for gifting.",
    price: 1450,
    imageUrl: "https://images.unsplash.com/photo-1629851628178-5a415ff6a422?auto=format&fit=crop&w=800&q=80",
    category: "Dates",
    currency: "INR",
    isFeatured: true
  },
  {
    id: "p_mabroom_1kg",
    name: "Mabroom Dates",
    description: "Chewy, less sweet, and mildly firm outer skin. These dates are highly sought after for a sustained energy release.",
    price: 1200,
    imageUrl: "https://plus.unsplash.com/premium_photo-1671402830847-f5dc8195e7ad?auto=format&fit=crop&w=800&q=80",
    category: "Dates",
    currency: "INR"
  },
  {
    id: "p_sukari_1kg",
    name: "Sukari Dates (Soft)",
    description: "Known as the sugar date, these are melt-in-your-mouth soft and deliciously sweet. Excellent with Arabian coffee.",
    price: 950,
    imageUrl: "https://images.unsplash.com/photo-1588600109919-4af70e28cf69?auto=format&fit=crop&w=800&q=80",
    category: "Dates",
    currency: "INR",
    isFeatured: false
  }
];

interface ProductContextType {
  products: Product[];
  loadingProducts: boolean;
  seedInitialProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const q = collection(db, 'products');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Product[] = [];
      snapshot.forEach(d => {
        fetched.push({ id: d.id, ...d.data() } as Product);
      });
      setProducts(fetched);
      setLoadingProducts(false);
    }, (error) => {
      console.error('Error fetching products:', error);
      setLoadingProducts(false);
    });

    return unsubscribe;
  }, []);

  const seedInitialProducts = async () => {
    try {
      const batch = writeBatch(db);
      INITIAL_SHOP_PRODUCTS.forEach(p => {
        const docRef = doc(db, 'products', p.id);
        batch.set(docRef, p);
      });
      await batch.commit();
      alert('Default products seeded to database!');
    } catch (e) {
      console.error(e);
      alert('Failed to seed products');
    }
  };

  return (
    <ProductContext.Provider value={{ products, loadingProducts, seedInitialProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};
