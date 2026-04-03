export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  category: string;
  stock: number;
  featured?: boolean;
  benefits?: string[];
  origin?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  shippingCharge: number;
  grandTotal: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    billingAddress?: string;
  };
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  logo: string;
  headerText: string;
  footerText: string;
  contactEmail: string;
  contactPhone: string;
  metaTitle: string;
  metaDescription: string;
  metaPixelId?: string;
  codEnabled: boolean;
  codInstructions: string;
  shippingCharge: number;
  freeShippingThreshold: number;
  bkashNumber?: string;
  nagadNumber?: string;
  slides: {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    link: string;
  }[];
  socialLinks: {
    platform: string;
    url: string;
  }[];
  aboutUs?: string;
  privacyPolicy?: string;
  termsConditions?: string;
  returnPolicy?: string;
  refundPolicy?: string;
  shippingPolicy?: string;
  faq?: string;
  contactUs?: string;
  cancellationPolicy?: string;
  extraDiscountInfo?: string;
  brands?: {
    id: string;
    name: string;
    logo: string;
  }[];
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  expiryDate?: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  order: number;
}
