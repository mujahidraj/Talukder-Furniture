import { create } from 'zustand';
import api from '../lib/api';
import { debounce } from '../lib/utils';

interface SearchState {
  isOpen: boolean;
  query: string;
  results: any[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (query: string) => void;
  search: (query: string, page?: number) => Promise<void>;
  loadMore: () => void;
  _debouncedSearch: (query: string) => void;
}

const useSearchStore = create<SearchState>((set, get) => ({
  isOpen: false,
  query: '',
  results: [],
  isLoading: false,
  hasMore: false,
  page: 1,

  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false, query: '', results: [], page: 1 }),

  setQuery: (query: string) => {
    set({ query, page: 1 });
    if (query.trim().length >= 2) {
      get()._debouncedSearch(query);
    } else {
      set({ results: [], hasMore: false });
    }
  },

  search: async (query: string, page: number = 1) => {
    if (!query || query.trim().length < 2) return;

    set({ isLoading: true });
    try {
      const { data } = await api.get('/products/search', {
        params: { q: query.trim(), page, limit: 8 },
      });

      if (page === 1) {
        set({
          results: data.products,
          hasMore: data.hasMore,
          isLoading: false,
          page,
        });
      } else {
        set((state) => ({
          results: [...state.results, ...data.products],
          hasMore: data.hasMore,
          isLoading: false,
          page,
        }));
      }
    } catch (error) {
      console.error('Search error:', error);
      set({ isLoading: false });
    }
  },

  loadMore: () => {
    const { query, page, hasMore, isLoading } = get();
    if (hasMore && !isLoading) {
      get().search(query, page + 1);
    }
  },

  _debouncedSearch: debounce((query: string) => {
    useSearchStore.getState().search(query, 1);
  }, 300),
}));

export default useSearchStore;
