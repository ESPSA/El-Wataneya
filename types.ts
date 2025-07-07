
export interface BilingualString {
  ar: string;
  en: string;
}

export interface Offer {
  id: string;
  title: BilingualString;
  description: BilingualString;
  discountPercentage: number;
  productIds: string[]; // Changed from itemIds, applies only to products
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  status: 'active' | 'scheduled' | 'expired';
}

export interface Product {
  id: string;
  name: BilingualString;
  categoryKey: 'aluminum' | 'kitchen';
  category: BilingualString;
  imageUrls: string[];
  price: BilingualString; // e.g., "120 EGP" or "Trade Pricing"
  origin: BilingualString;
  description: BilingualString;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Project {
  id: string;
  title: BilingualString;
  imageUrls: string[];
  artisanId: string;
  location: BilingualString;
  styleKey: 'modern' | 'classic' | 'neo';
  style: BilingualString;
  productsUsed: string[];
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
}

export interface CartItem {
    id: string; // product id
    name: BilingualString;
    category: BilingualString;
    price: number;
    quantity: number;
    imageUrl: string;
    offerDiscountPercentage?: number;
}


export interface Artisan {
  id: string;
  name: string;
  location: BilingualString;
  experience: number;
  specialties: BilingualString[];
  isCertified: boolean;
  avatarUrl: string;
  projects: Project[];
  bio: BilingualString;
  phone: string;
}

export interface Article {
  id: string;
  title: BilingualString;
  content: BilingualString;
  summary: BilingualString;
  imageUrl: string;
  authorId: string;
  authorName: string;
  status: 'published' | 'draft';
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}

export interface AdminPermissions {
    canManageProducts: boolean;
    canManageProjects: boolean;
    canManageUsers: boolean;
    canManageAdmins: boolean;
    canManageArticles: boolean;
}

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Storing password client-side is for mock purposes only. NEVER do this in a real app.
  type: 'user' | 'artisan' | 'admin';
  permissions?: AdminPermissions;
  isPrimary?: boolean;
  avatarUrl?: string;
};