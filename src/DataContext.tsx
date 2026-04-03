import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, Category } from './types';

interface DataContextType {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  products: [],
  categories: [],
  loading: true,
  error: null,
  refreshData: async () => {},
});

const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: "Sundarban Honey 1kg",
    description: "100% natural, raw honey collected directly from the Sundarbans forest.",
    price: 2200,
    oldPrice: 2500,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80",
    category: "Honey",
    stock: 50,
    featured: true,
  },
  {
    name: "Deshi Mustard Oil 5 liter",
    description: "Cold-pressed mustard oil, perfect for traditional cooking.",
    price: 1550,
    oldPrice: 1800,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80",
    category: "Oil",
    stock: 15,
    featured: true,
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const productsSnap = await getDocs(collection(db, 'products'));
      const categoriesSnap = await getDocs(query(collection(db, 'categories'), orderBy('order', 'asc')));

      let fetchedProducts = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      let fetchedCategories = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];

      // Seed categories if empty
      if (categoriesSnap.empty) {
        const defaultCategories = ['Honey', 'Oil', 'Ghee', 'Dessert', 'Dates', 'Nuts'];
        const seededCategories: Category[] = [];
        for (let i = 0; i < defaultCategories.length; i++) {
          const catData = { 
            name: defaultCategories[i], 
            order: i, 
            image: `https://api.dicebear.com/7.x/initials/svg?seed=${defaultCategories[i]}`, 
            description: `Pure and natural ${defaultCategories[i]}` 
          };
          const docRef = await addDoc(collection(db, 'categories'), catData);
          seededCategories.push({ ...catData, id: docRef.id });
        }
        fetchedCategories = seededCategories;
      }

      // Seed products ONLY if both collections are empty (initial setup)
      // This prevents re-seeding default products if the user deletes them but keeps categories
      if (productsSnap.empty && categoriesSnap.empty) {
        const seededProducts: Product[] = [];
        for (const p of INITIAL_PRODUCTS) {
          const docRef = await addDoc(collection(db, 'products'), p);
          seededProducts.push({ ...p, id: docRef.id });
        }
        fetchedProducts = seededProducts;
      }

      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ 
      products, 
      categories, 
      loading, 
      error, 
      refreshData: fetchData 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
