import { create } from 'zustand';
import { useAuthStore } from './authStore';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerVarsityId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  ratings: Rating[];
}

interface Rating {
  id: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductState {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'sellerVarsityId' | 'status' | 'createdAt' | 'ratings'>) => Promise<void>;
  approveProduct: (productId: string) => void;
  rejectProduct: (productId: string) => void;
  addRating: (productId: string, rating: Omit<Rating, 'id' | 'createdAt'>) => void;
  getProductById: (id: string) => Product | undefined;
}

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'iPhone 12 Pro - Excellent Condition',
    description: 'Selling my iPhone 12 Pro in excellent condition. No scratches, battery health 95%. Comes with original charger and box.',
    price: 85000,
    category: 'Phone',
    location: 'BUBT Campus, Mirpur',
    images: [
      'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1275229/pexels-photo-1275229.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    sellerId: '22235103001',
    sellerName: 'John Doe',
    sellerVarsityId: '22235103001',
    status: 'approved',
    createdAt: '2024-01-15T10:00:00Z',
    ratings: [
      {
        id: '1',
        buyerId: '22235103002',
        buyerName: 'Jane Smith',
        rating: 5,
        comment: 'Great seller! Phone was exactly as described.',
        createdAt: '2024-01-16T15:30:00Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Programming Books Bundle',
    description: 'Complete set of programming books including Java, Python, and Data Structures. Perfect for CSE students.',
    price: 2500,
    category: 'Book',
    location: 'BUBT Library Area',
    images: [
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1290141/pexels-photo-1290141.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    sellerId: '22235103002',
    sellerName: 'Jane Smith',
    sellerVarsityId: '22235103002',
    status: 'approved',
    createdAt: '2024-01-14T08:30:00Z',
    ratings: []
  },
  {
    id: '3',
    title: 'Gaming Laptop - ASUS ROG',
    description: 'High-performance gaming laptop. Intel i7, 16GB RAM, RTX 3060. Perfect for gaming and development work.',
    price: 120000,
    category: 'Computer',
    location: 'BUBT Campus Gate',
    images: [
      'https://images.pexels.com/photos/5698171/pexels-photo-5698171.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1251850/pexels-photo-1251850.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    sellerId: '22235103001',
    sellerName: 'John Doe',
    sellerVarsityId: '22235103001',
    status: 'pending',
    createdAt: '2024-01-16T14:20:00Z',
    ratings: []
  },
  {
    id: '4',
    title: 'Mountain Bike - Almost New',
    description: 'Excellent mountain bike, barely used. Perfect for campus commute and weekend adventures.',
    price: 15000,
    category: 'Bike',
    location: 'BUBT Sports Complex',
    images: [
      'https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/170851/pexels-photo-170851.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    sellerId: '22235103002',
    sellerName: 'Jane Smith',
    sellerVarsityId: '22235103002',
    status: 'approved',
    createdAt: '2024-01-13T16:45:00Z',
    ratings: [
      {
        id: '2',
        buyerId: '22235103001',
        buyerName: 'John Doe',
        rating: 4,
        comment: 'Good bike, fair price!',
        createdAt: '2024-01-14T12:00:00Z'
      }
    ]
  }
];

export const useProductStore = create<ProductState>((set, get) => ({
  products: mockProducts,

  addProduct: async (productData) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      sellerId: user.varsityId,
      sellerName: user.fullName,
      sellerVarsityId: user.varsityId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ratings: [],
    };

    set(state => ({
      products: [...state.products, newProduct]
    }));
  },

  approveProduct: (productId: string) => {
    set(state => ({
      products: state.products.map(product =>
        product.id === productId
          ? { ...product, status: 'approved' as const }
          : product
      )
    }));
  },

  rejectProduct: (productId: string) => {
    set(state => ({
      products: state.products.map(product =>
        product.id === productId
          ? { ...product, status: 'rejected' as const }
          : product
      )
    }));
  },

  addRating: (productId: string, ratingData) => {
    const newRating: Rating = {
      ...ratingData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      products: state.products.map(product =>
        product.id === productId
          ? { ...product, ratings: [...product.ratings, newRating] }
          : product
      )
    }));
  },

  getProductById: (id: string) => {
    return get().products.find(product => product.id === id);
  },
}));