import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

interface PurchaseButtonProps {
  product: Product;
  onPurchaseSuccess?: () => void;
}

interface PaymentData {
  email: string;
  amount: number;
  reference: string;
  authorization_url: string;
}

export default function PurchaseButton({ product, onPurchaseSuccess }: PurchaseButtonProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const initializePaymentMutation = useMutation({
    mutationFn: async (data: { email: string; productId: string }) => {
      const response = await fetch('/api/initialize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment initialization failed');
      }
      
      return response.json() as Promise<PaymentData>;
    },
    onSuccess: (data) => {
      // Redirect to Paystack payment page
      window.open(data.authorization_url, '_blank');
      setShowPaymentForm(false);
      toast({
        title: "Payment Initialized",
        description: "Redirecting to secure payment page...",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePurchase = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      await initializePaymentMutation.mutateAsync({
        email,
        productId: product.id,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const supplierPrice = parseFloat(product.price);
  const retailPrice = supplierPrice * 1.10; // 10% profit margin
  const profit = retailPrice - supplierPrice;

  return (
    <>
      <Button 
        onClick={() => setShowPaymentForm(true)}
        className="w-full bg-success hover:bg-success/90 text-white font-semibold py-3"
        data-testid={`button-purchase-${product.id}`}
      >
        <i className="fas fa-shopping-cart mr-2"></i>
        Buy Now - ₦{retailPrice.toFixed(2)}
      </Button>

      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-md" data-testid="modal-purchase-form">
          <DialogTitle className="flex items-center">
            <i className="fas fa-credit-card text-success mr-2"></i>
            Complete Your Purchase
          </DialogTitle>

          <div className="space-y-4">
            {/* Product Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                </div>
              </div>
              
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Supplier Price:</span>
                  <span>₦{supplierPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-success font-semibold">
                  <span>Your Price (10% markup):</span>
                  <span>₦{retailPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Platform Profit:</span>
                  <span>₦{profit.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center text-blue-800 text-sm">
                  <i className="fas fa-info-circle mr-2"></i>
                  <span>Secure payment powered by Paystack</span>
                </div>
                <ul className="mt-2 text-xs text-blue-700 space-y-1">
                  <li>• AI-powered global sourcing</li>
                  <li>• Automatic supplier purchasing</li>
                  <li>• Order tracking included</li>
                  <li>• 10% profit margin applied</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1"
                  data-testid="button-cancel-purchase"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={isProcessing || !email}
                  className="flex-1 bg-success hover:bg-success/90"
                  data-testid="button-confirm-purchase"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock mr-2"></i>
                      Pay ₦{retailPrice.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center">
              By proceeding, you agree to automated dropshipping and order fulfillment
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}