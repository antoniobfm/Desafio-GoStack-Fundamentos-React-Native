import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      await AsyncStorage.removeItem('@GoMarketplace:cart');
      const cartStorage = await AsyncStorage.getItem('@GoMarketplace:cart');
      cartStorage && setProducts(JSON.parse(cartStorage));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newProduct = {
        ...product,
        quantity: 1,
      };

      setProducts([...products, newProduct]);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsUpdatez = products.map(
        (item): Product => {
          if (item.id === id) {
            const product = {
              id,
              title: item.title,
              image_url: item.image_url,
              price: item.price,
              quantity: item.quantity + 1,
            };
            return product;
          }
          return item;
        },
      );

      setProducts(productsUpdatez);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsUpdatez = products.map(
        (item): Product => {
          if (item.id === id) {
            const product = {
              id,
              title: item.title,
              image_url: item.image_url,
              price: item.price,
              quantity: item.quantity - 1,
            };
            return product;
          }
          return item;
        },
      );

      setProducts(productsUpdatez);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
