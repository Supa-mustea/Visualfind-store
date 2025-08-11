import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import type { Product } from "@shared/schema";

interface ProductWithSimilarity extends Product {
  similarity?: number;
}

interface ProductsGridProps {
  products: ProductWithSimilarity[];
  onProductClick: (product: Product) => void;
  showSimilarity: boolean;
}

export default function ProductsGrid({ products, onProductClick, showSimilarity }: ProductsGridProps) {
  return (
    <div className="lg:col-span-3">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
          <p className="text-sm text-gray-600" data-testid="text-results-count">
            {products.length} products found
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select defaultValue="relevance">
            <SelectTrigger className="w-[200px]" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Sort by Relevance</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border border-gray-300 rounded-lg">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 text-primary border-r border-gray-300"
              data-testid="button-grid-view"
            >
              <i className="fas fa-th"></i>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 text-gray-400"
              data-testid="button-list-view"
            >
              <i className="fas fa-list"></i>
            </Button>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-search text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters or upload a different image</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductClick(product)}
                showSimilarity={showSimilarity}
              />
            ))}
          </div>

          {products.length > 6 && (
            <div className="text-center mt-12">
              <Button 
                className="bg-primary text-white hover:bg-primary-dark px-8 py-3"
                data-testid="button-load-more"
              >
                Load More Products
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
