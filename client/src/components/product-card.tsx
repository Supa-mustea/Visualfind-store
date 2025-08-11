import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

interface ProductWithSimilarity extends Product {
  similarity?: number;
  profit?: number;
  supplierUrl?: string;
  country?: string;
  deliveryDays?: number;
}

interface ProductCardProps {
  product: ProductWithSimilarity;
  onClick: () => void;
  showSimilarity: boolean;
}

export default function ProductCard({ product, onClick, showSimilarity }: ProductCardProps) {
  const isGloballySourced = product.profit !== undefined;
  
  const getSimilarityBadge = (similarity?: number) => {
    if (!similarity) return null;
    
    const percentage = Math.round(similarity * 100);
    let badgeClass = "bg-success";
    
    if (percentage < 85) {
      badgeClass = "bg-warning";
    }
    if (percentage < 75) {
      badgeClass = "bg-danger";
    }
    
    return (
      <span className={`${badgeClass} text-white px-2 py-1 rounded-full text-xs font-medium`}>
        {percentage}% Match
      </span>
    );
  };

  const getProfitBadge = (profit?: number) => {
    if (!profit) return null;
    
    return (
      <span className="bg-gradient-to-r from-success to-primary text-white px-2 py-1 rounded-full text-xs font-medium">
        <i className="fas fa-coins mr-1"></i>
        +${profit.toFixed(0)} profit
      </span>
    );
  };

  const renderStars = (rating: string) => {
    const numStars = parseFloat(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= numStars) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400 text-xs"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-yellow-400 text-xs"></i>);
      }
    }
    
    return stars;
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
      onClick={onClick}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute top-3 right-3 space-y-2">
          {showSimilarity && product.similarity && getSimilarityBadge(product.similarity)}
          {isGloballySourced && getProfitBadge(product.profit)}
        </div>

        <div className="absolute top-3 left-3">
          {isGloballySourced && (
            <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium mr-2">
              <i className="fas fa-robot mr-1"></i>
              AI Sourced
            </span>
          )}
          <Button 
            size="sm"
            variant="ghost"
            className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white"
            onClick={(e) => e.stopPropagation()}
            data-testid={`button-favorite-${product.id}`}
          >
            <i className="far fa-heart text-gray-600"></i>
          </Button>
        </div>

        {isGloballySourced && product.country && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
              <i className="fas fa-map-marker-alt mr-1"></i>
              {product.country}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-1" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h4>
        <p className="text-sm text-gray-600 mb-2" data-testid={`text-product-brand-${product.id}`}>
          {product.brand}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900" data-testid={`text-price-${product.id}`}>
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <div className="flex">
              {renderStars(product.rating || "0")}
            </div>
            <span className="text-sm text-gray-600 ml-1" data-testid={`text-reviews-${product.id}`}>
              ({product.reviewCount})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
