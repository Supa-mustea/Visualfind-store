import { useState } from "react";
import Header from "@/components/header";
import UploadZone from "@/components/upload-zone";
import FiltersSidebar from "@/components/filters-sidebar";
import ProductsGrid from "@/components/products-grid";
import ProductModal from "@/components/product-modal";
import ChatWidget from "@/components/chat-widget";
import LoadingOverlay from "@/components/loading-overlay";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

interface ProductWithSimilarity extends Product {
  similarity?: number;
}

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchResults, setSearchResults] = useState<ProductWithSimilarity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: 0,
    maxPrice: 1000,
    brand: "",
    similarity: "most-similar"
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const handleImageUpload = async (file: File) => {
    setIsSearching(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleExampleSearch = (category: string) => {
    const filtered = allProducts.filter(product => 
      product.category.toLowerCase().includes(category.toLowerCase())
    ).map(product => ({
      ...product,
      similarity: Math.max(0.8, Math.random() * 0.2 + 0.8)
    }));
    
    setSearchResults(filtered);
  };

  const displayProducts = searchResults.length > 0 ? searchResults : allProducts;
  const filteredProducts = displayProducts.filter(product => {
    if (filters.category && !product.category.toLowerCase().includes(filters.category.toLowerCase())) {
      return false;
    }
    if (filters.brand && !product.brand.toLowerCase().includes(filters.brand.toLowerCase())) {
      return false;
    }
    const price = parseFloat(product.price);
    if (price < filters.minPrice || price > filters.maxPrice) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Products with Visual Search
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload an image and discover similar products instantly using our AI-powered visual search technology
            </p>
          </div>

          <UploadZone 
            onImageUpload={handleImageUpload}
            onExampleSearch={handleExampleSearch}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <FiltersSidebar 
            filters={filters}
            onFiltersChange={handleFilterChange}
          />
          
          <ProductsGrid 
            products={filteredProducts}
            onProductClick={setSelectedProduct}
            showSimilarity={searchResults.length > 0}
          />
        </div>
      </main>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <ChatWidget />
      
      {isSearching && <LoadingOverlay />}
    </div>
  );
}
