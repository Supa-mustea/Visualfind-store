import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface PurchaseButtonProps {
  product: Product;
}

interface ProductWithExtras extends Product {
  profit?: number;
  supplierUrl?: string;
  country?: string;
  deliveryDays?: number;
}

export default function PurchaseButton({ product }: PurchaseButtonProps) {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    zipCode: "",
    country: ""
  });
  const { toast } = useToast();

  const productWithExtras = product as ProductWithExtras;
  const isGloballySourced = productWithExtras.profit !== undefined;
  const estimatedProfit = productWithExtras.profit || (parseFloat(product.price) * 0.1);

  const purchaseMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/purchase', orderData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order Placed Successfully!",
        description: `Your order has been processed automatically. Tracking: ${data.trackingNumber}. Profit earned: $${data.profit.toFixed(2)}`,
      });
      setShowOrderForm(false);
      setCustomerInfo({
        email: "",
        name: "",
        address: "",
        city: "",
        zipCode: "",
        country: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to process your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (isGloballySourced) {
      setShowOrderForm(true);
    } else {
      toast({
        title: "Standard Purchase",
        description: "This is a regular product. Use the upload feature to find globally sourced items with automatic purchasing.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerInfo.email || !customerInfo.address || !customerInfo.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const fullAddress = `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.zipCode}, ${customerInfo.country}`;
    
    purchaseMutation.mutate({
      productId: product.id,
      customerEmail: customerInfo.email,
      customerAddress: fullAddress,
      productName: product.name,
      originalPrice: productWithExtras.originalPrice || product.price,
      sellingPrice: product.price,
      supplierUrl: productWithExtras.supplierUrl
    });
  };

  return (
    <>
      <Button 
        className="flex-1 bg-primary text-white hover:bg-primary-dark py-3 relative"
        onClick={handlePurchase}
        data-testid="button-purchase-product"
      >
        {isGloballySourced ? (
          <>
            <i className="fas fa-robot mr-2"></i>
            AI Auto-Purchase
          </>
        ) : (
          <>
            <i className="fas fa-shopping-cart mr-2"></i>
            Add to Cart
          </>
        )}
        {isGloballySourced && (
          <span className="absolute -top-2 -right-2 bg-success text-white text-xs px-2 py-1 rounded-full">
            +${estimatedProfit.toFixed(0)} profit
          </span>
        )}
      </Button>

      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="max-w-md" data-testid="modal-purchase-form">
          <DialogTitle>Automated Global Purchase</DialogTitle>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-success/10 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <i className="fas fa-robot text-primary mr-2"></i>
                <span className="font-semibold">AI-Powered Dropshipping</span>
              </div>
              <p className="text-sm text-gray-600">
                This product will be automatically sourced and shipped globally. 
                Your profit: <span className="font-bold text-success">${estimatedProfit.toFixed(2)}</span>
              </p>
              {productWithExtras.country && (
                <p className="text-xs text-gray-500 mt-1">
                  Sourced from: {productWithExtras.country} • 
                  Delivery: {productWithExtras.deliveryDays || 7-14} days
                </p>
              )}
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    placeholder="Full name"
                    required
                    data-testid="input-customer-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    placeholder="customer@email.com"
                    required
                    data-testid="input-customer-email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  placeholder="123 Main Street"
                  required
                  data-testid="input-customer-address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                    placeholder="City"
                    required
                    data-testid="input-customer-city"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={customerInfo.zipCode}
                    onChange={(e) => setCustomerInfo({...customerInfo, zipCode: e.target.value})}
                    placeholder="12345"
                    required
                    data-testid="input-customer-zip"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={customerInfo.country}
                    onChange={(e) => setCustomerInfo({...customerInfo, country: e.target.value})}
                    placeholder="USA"
                    required
                    data-testid="input-customer-country"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1"
                  data-testid="button-cancel-purchase"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-success text-white hover:bg-success/90"
                  disabled={purchaseMutation.isPending}
                  data-testid="button-confirm-purchase"
                >
                  {purchaseMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Confirm Purchase
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}