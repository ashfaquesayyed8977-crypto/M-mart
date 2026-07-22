import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import type { CartItem, WishlistItem } from '@/types';

type StoreContextValue = {
  cart: CartItem[];
  wishlist: WishlistItem[];
  cartCount: number;
  cartTotal: number;
  loadingCart: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<{ error: string | null }>;
  updateCartQty: (cartId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<{ error: string | null; added: boolean }>;
  inWishlist: (productId: string) => boolean;
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(false);

  const loadCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    setLoadingCart(true);
    const { data } = await supabase
      .from('cart')
      .select('*, product:products(*, product_images(*))')
      .eq('user_id', user.id);
    setCart((data ?? []) as unknown as CartItem[]);
    setLoadingCart(false);
  }, [user]);

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    const { data } = await supabase
      .from('wishlist')
      .select('*, product:products(*, product_images(*))')
      .eq('user_id', user.id);
    setWishlist((data ?? []) as unknown as WishlistItem[]);
  }, [user]);

  useEffect(() => {
    loadCart();
    loadWishlist();
  }, [loadCart, loadWishlist]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!user) return { error: 'Please sign in to add items to your cart.' };
      const existing = cart.find((c) => c.product_id === productId);
      if (existing) {
        const { error } = await supabase
          .from('cart')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
        if (error) return { error: error.message };
      } else {
        const { error } = await supabase
          .from('cart')
          .insert({ user_id: user.id, product_id: productId, quantity });
        if (error) return { error: error.message };
      }
      await loadCart();
      return { error: null };
    },
    [user, cart, loadCart]
  );

  const updateCartQty = useCallback(
    async (cartId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(cartId);
        return;
      }
      await supabase.from('cart').update({ quantity }).eq('id', cartId);
      await loadCart();
    },
    [loadCart]
  );

  const removeFromCart = useCallback(
    async (cartId: string) => {
      await supabase.from('cart').delete().eq('id', cartId);
      await loadCart();
    },
    [loadCart]
  );

  const clearCart = useCallback(async () => {
    if (!user) return;
    await supabase.from('cart').delete().eq('user_id', user.id);
    await loadCart();
  }, [user, loadCart]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!user) return { error: 'Please sign in to use your wishlist.', added: false };
      const existing = wishlist.find((w) => w.product_id === productId);
      if (existing) {
        await supabase.from('wishlist').delete().eq('id', existing.id);
        await loadWishlist();
        return { error: null, added: false };
      }
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });
      if (error) return { error: error.message, added: false };
      await loadWishlist();
      return { error: null, added: true };
    },
    [user, wishlist, loadWishlist]
  );

  const inWishlist = useCallback(
    (productId: string) => wishlist.some((w) => w.product_id === productId),
    [wishlist]
  );

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => {
    const p = c.product;
    if (!p) return sum;
    const price = p.sale_price && p.sale_price > 0 && p.sale_price < p.price ? p.sale_price : p.price;
    return sum + price * c.quantity;
  }, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        cartCount,
        cartTotal,
        loadingCart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        inWishlist,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
