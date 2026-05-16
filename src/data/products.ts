export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp?: number;
  imageUrl: string;
  category: string;
  currency: string;
  isFeatured?: boolean;
}

export const SHOP_PRODUCTS: Product[] = [
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
