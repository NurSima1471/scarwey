import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Product, PaginatedResponse, ProductFilters } from '../../types';

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  currentProduct: Product | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  } | null;
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  pagination: null,
  filters: {
    page: 1,
    pageSize: 12,
    sortBy: 'name',
  },
  isLoading: false,
  error: null,
};

// ✅ DÜZELTME: sale ve featured parametreleri eklendi
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters: any) => { // Geçici olarak any kullanıyoruz
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    
    // ✅ EN ÖNEMLİ DÜZELTME: Sale ve Featured parametreleri
    if (filters.featured !== undefined && filters.featured !== null) {
      params.append('featured', filters.featured.toString());
    }
    if (filters.sale !== undefined && filters.sale !== null) {
      params.append('sale', filters.sale.toString());
    }

    console.log('📤 API Request URL:', `/products?${params.toString()}`);
    console.log('📤 Filters being sent:', filters);

    const response = await api.get<PaginatedResponse<Product>>(`/products?${params}`);
    return response.data;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: number) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async () => {
    const response = await api.get<Product[]>('/products/featured');
    return response.data;
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query: string) => {
    const response = await api.get<string[]>(`/products/search-suggestions?q=${query}`);
    return response.data;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        pageSize: 12,
        sortBy: 'name',
      };
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });

    // Fetch Product By ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch product';
      });

    // Fetch Featured Products
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch featured products';
      });
  },
});

export const { setFilters, resetFilters, clearCurrentProduct, clearError } = productSlice.actions;
export default productSlice.reducer;