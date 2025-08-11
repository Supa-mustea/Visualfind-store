import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const renderStars = (rating: string) => {
    const numStars = parseFloat(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= numStars) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-yellow-400"></i>);
      }
    }
    
    return stars;
  };

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-0"
        data-testid="modal-product-detail"
      >
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white"
            onClick={onClose}
            data-testid="button-close-modal"
          >
            <i className="fas fa-times text-gray-600"></i>
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div>
              <img 
                src={product.imageUrl} 
                alt={`${product.name} - detailed view`}
                className="w-full rounded-xl shadow-lg"
                data-testid="img-product-main"
              />
              {product.additionalImages && product.additionalImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {product.additionalImages.map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`${product.name} angle ${index + 1}`}
                      className="rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                      data-testid={`img-product-thumbnail-${index}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </DialogTitle>
                <p className="text-lg text-gray-600" data-testid="text-product-brand">
                  {product.brand}
                </p>
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {renderStars(product.rating || "0")}
                  </div>
                  <span className="text-gray-600 ml-2" data-testid="text-product-rating">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-gray-900" data-testid="text-product-price">
                  ${product.price}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                    <span className="bg-danger text-white px-2 py-1 rounded-full text-sm">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              
              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600" data-testid="text-product-description">
                    {product.description}
                  </p>
                </div>
              )}
              
              {product.specifications && product.specifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Specifications</h3>
                  <ul className="text-sm text-gray-600 space-y-1" data-testid="list-product-specs">
                    {product.specifications.map((spec, index) => (
                      <li key={index}>• {spec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex space-x-4">
                <Button 
                  className="flex-1 bg-primary text-white hover:bg-primary-dark py-3"
                  data-testid="button-add-to-cart"
                >
                  Add to Cart
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  className="px-6 py-3"
                  data-testid="button-add-to-favorites"
                >
                  <i className="far fa-heart"></i>
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  className="px-6 py-3"
                  data-testid="button-share-product"
                >
                  <i className="fas fa-share-alt"></i>
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <i className="fas fa-truck text-success mr-2"></i>
                    <span>Free shipping</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-undo text-primary mr-2"></i>
                    <span>30-day returns</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-shield-alt text-success mr-2"></i>
                    <span>2-year warranty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
