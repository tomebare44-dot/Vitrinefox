export interface Product {
  id: string;
  name: string;
  originalPrice: number | null;
  discountPercent: number;
  promoPrice: number | null;
  stock: number;
  affiliateUrl: string;
  categoryId: string | null;
  isPublished: boolean;
  imageUrl: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl: string | null;
  heroBadgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string | null;
  whatsappUrl: string;
  instagramUrl: string;
  telegramUrl: string;
  offerButtonText: string;
  announcementText: string;
  isAnnouncementActive: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  hiddenProducts: number;
  outOfStockProducts: number;
  discountedProducts: number;
  totalCategories: number;
}

export type SortOption = 'recent' | 'price_asc' | 'price_desc' | 'discount_desc';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
