import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isScrolled: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openMobileMenu: () => void;
  setScrolled: (isScrolled: boolean) => void;
}

const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isScrolled: false,

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),

  setScrolled: (isScrolled) => set({ isScrolled }),
}));

export default useUIStore;
