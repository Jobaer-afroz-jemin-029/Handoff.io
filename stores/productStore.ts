import { create } from 'zustand';
import { useAuthStore } from './authStore';

interface Product {
  _id?: string;
  id?: string;
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
  _id?: string;
  id?: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (productData: FormData) => Promise<boolean>;
  fetchProducts: () => Promise<void>;
  approveProduct: (productId: string) => Promise<boolean>;
  rejectProduct: (productId: string) => Promise<boolean>;
  addRating: (
    productId: string,
    rating: Omit<Rating, 'id' | 'createdAt'>
  ) => Promise<boolean>;
  getProductById: (id: string) => Product | undefined;
}


//const API_BASE_URL = 'http://192.168.1.105:8000/api'; 
const API_BASE_URL = 'https://handoff-backend.onrender.com/api'; 

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching products from:', `${API_BASE_URL}/products`);
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const products = await response.json();
      console.log('Fetched products:', products.length, 'products');
      set({ products, loading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch products',
        loading: false,
      });
    }
  },

  addProduct: async (productData: FormData) => {
  const { user } = useAuthStore.getState();
  console.log('AddProduct - User state:', user);
  console.log('AddProduct - User varsityId:', user?.varsityId); // Log to verify

  if (!user) {
    console.log('AddProduct - No user found');
    set({ error: 'User not authenticated' });
    return false;
  }

  set({ loading: true, error: null });
  try {
    const token = await getAuthToken();
    console.log('AddProduct - Token:', token ? 'Found' : 'Not found');
    
    if (!token) {
      console.log('AddProduct - No token found');
      set({ error: 'Authentication token not found', loading: false });
      return false;
    }

    console.log('Sending request to:', `${API_BASE_URL}/products/add`);
    const response = await fetch(`${API_BASE_URL}/products/add`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: productData,
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || 'Failed to add product');
    }

    const responseData = await response.json();
    console.log('Product added successfully:', responseData);

    await get().fetchProducts();
    set({ loading: false });
    return true;
  } catch (error) {
    console.error('Error adding product:', error);
    set({
      error: error instanceof Error ? error.message : 'Failed to add product',
      loading: false,
    });
    return false;
  }
},

  approveProduct: async (productId: string) => {
    set({ loading: true, error: null });
    try {
      const token = await getAuthToken();
      if (!token) {
        set({ error: 'Authentication token not found', loading: false });
        return false;
      }

      const response = await fetch(
        `${API_BASE_URL}/products/approve/${productId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve product');
      }

      // Update local state
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId || product.id === productId
            ? { ...product, status: 'approved' as const }
            : product
        ),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to approve product',
        loading: false,
      });
      return false;
    }
  },

  rejectProduct: async (productId: string) => {
    set({ loading: true, error: null });
    try {
      const token = await getAuthToken();
      if (!token) {
        set({ error: 'Authentication token not found', loading: false });
        return false;
      }

      const response = await fetch(
        `${API_BASE_URL}/products/reject/${productId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject product');
      }

      // Update local state
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId || product.id === productId
            ? { ...product, status: 'rejected' as const }
            : product
        ),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to reject product',
        loading: false,
      });
      return false;
    }
  },

  addRating: async (productId: string, ratingData) => {
    set({ loading: true, error: null });
    try {
      const token = await getAuthToken();
      if (!token) {
        set({ error: 'Authentication token not found', loading: false });
        return false;
      }

      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/ratings`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ratingData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add rating');
      }

      // Refresh products to get updated ratings
      await get().fetchProducts();
      set({ loading: false });
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add rating',
        loading: false,
      });
      return false;
    }
  },

  getProductById: (id: string) => {
    return get().products.find(
      (product) => product._id === id || product.id === id
    );
  },
}));

// Helper function to get auth token
const getAuthToken = async (): Promise<string | null> => {
  try {
    const { getToken } = useAuthStore.getState();
    return getToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};
