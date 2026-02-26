/**
 * ساس — Products Store (Zustand)
 * المحادثة ٣: إدارة المنتجات
 */

import { create } from 'zustand';
import { api, ApiError } from '@/lib/api';
import type { Product, Category } from '@/lib/types';

// ═══ Types ═══

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  sale_price?: number;
  cost_price?: number;
  sku?: string;
  quantity: number;
  category_id?: string;
  type: 'physical' | 'digital';
  status: 'active' | 'draft' | 'archived';
  is_featured: boolean;
  tags: string[];
  weight?: number;
}

interface ProductsState {
  products: Product[];
  categories: Category[];
  selectedProduct: Product | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Pagination
  page: number;
  totalPages: number;
  total: number;
  
  // Filters
  search: string;
  statusFilter: string;
  categoryFilter: string;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<Product | null>;
  createProduct: (data: ProductFormData) => Promise<Product | null>;
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  fetchCategories: () => Promise<void>;
  createCategory: (name: string, description?: string) => Promise<Category | null>;
  updateCategory: (id: string, name: string, description?: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Setters
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setCategoryFilter: (category: string) => void;
  clearError: () => void;
}

// ═══ Store ═══

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: [],
  selectedProduct: null,
  isLoading: false,
  isSaving: false,
  error: null,
  page: 1,
  totalPages: 1,
  total: 0,
  search: '',
  statusFilter: '',
  categoryFilter: '',

  // ═══ Fetch Products ═══
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { page, search, statusFilter, categoryFilter } = get();
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category_id', categoryFilter);

      const result = await api.get(`/api/products?${params}`);
      
      set({
        products: result.data || [],
        total: result.pagination?.total || result.data?.length || 0,
        totalPages: result.pagination?.totalPages || 1,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: (err as ApiError).message || 'فشل جلب المنتجات' });
    }
  },

  // ═══ Fetch Single Product ═══
  fetchProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.get(`/api/products/${id}`);
      const product = result.data;
      set({ selectedProduct: product, isLoading: false });
      return product;
    } catch (err) {
      set({ isLoading: false, error: (err as ApiError).message });
      return null;
    }
  },

  // ═══ Create Product ═══
  createProduct: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const result = await api.post('/api/products', data);
      const product = result.data;
      set((state) => ({
        products: [product, ...state.products],
        total: state.total + 1,
        isSaving: false,
      }));
      return product;
    } catch (err) {
      set({ isSaving: false, error: (err as ApiError).message || 'فشل إضافة المنتج' });
      return null;
    }
  },

  // ═══ Update Product ═══
  updateProduct: async (id, data) => {
    set({ isSaving: true, error: null });
    try {
      const result = await api.put(`/api/products/${id}`, data);
      const updated = result.data;
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        selectedProduct: state.selectedProduct?.id === id ? { ...state.selectedProduct, ...updated } : state.selectedProduct,
        isSaving: false,
      }));
      return true;
    } catch (err) {
      set({ isSaving: false, error: (err as ApiError).message || 'فشل تحديث المنتج' });
      return false;
    }
  },

  // ═══ Delete Product ═══
  deleteProduct: async (id) => {
    set({ error: null });
    try {
      await api.delete(`/api/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        total: state.total - 1,
      }));
      return true;
    } catch (err) {
      set({ error: (err as ApiError).message || 'فشل حذف المنتج' });
      return false;
    }
  },

  // ═══ Fetch Categories ═══
  fetchCategories: async () => {
    try {
      const result = await api.get('/api/categories');
      set({ categories: result.data || [] });
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  },

  // ═══ Create Category ═══
  createCategory: async (name, description) => {
    set({ isSaving: true, error: null });
    try {
      const result = await api.post('/api/categories', { name, description });
      const category = result.data;
      set((state) => ({
        categories: [...state.categories, category],
        isSaving: false,
      }));
      return category;
    } catch (err) {
      set({ isSaving: false, error: (err as ApiError).message });
      return null;
    }
  },

  // ═══ Update Category ═══
  updateCategory: async (id, name, description) => {
    set({ isSaving: true, error: null });
    try {
      await api.put(`/api/categories/${id}`, { name, description });
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, name, description } : c)),
        isSaving: false,
      }));
      return true;
    } catch (err) {
      set({ isSaving: false, error: (err as ApiError).message });
      return false;
    }
  },

  // ═══ Delete Category ═══
  deleteCategory: async (id) => {
    set({ error: null });
    try {
      await api.delete(`/api/categories/${id}`);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
      return true;
    } catch (err) {
      set({ error: (err as ApiError).message });
      return false;
    }
  },

  // ═══ Setters ═══
  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search, page: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter, page: 1 }),
  clearError: () => set({ error: null }),
}));
