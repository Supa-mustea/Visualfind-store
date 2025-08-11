import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { DropshipOrder } from "@shared/schema";

interface OrdersDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrdersDashboard({ isOpen, onClose }: OrdersDashboardProps) {
  const { data: orders = [], isLoading } = useQuery<DropshipOrder[]>({
    queryKey: ['/api/orders'],
    enabled: isOpen,
  });

  const totalProfit = orders.reduce((sum, order) => sum + parseFloat(order.profit), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.orderStatus === 'pending').length;
  const completedOrders = orders.filter(order => order.orderStatus === 'completed').length;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { class: 'bg-warning', icon: 'fas fa-clock' },
      'processing': { class: 'bg-primary', icon: 'fas fa-cog fa-spin' },
      'shipped': { class: 'bg-info', icon: 'fas fa-shipping-fast' },
      'completed': { class: 'bg-success', icon: 'fas fa-check' },
      'failed': { class: 'bg-danger', icon: 'fas fa-times' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`${config.class} text-white px-2 py-1 rounded-full text-xs font-medium inline-flex items-center`}>
        <i className={`${config.icon} mr-1`}></i>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-orders-dashboard">
        <DialogTitle className="flex items-center">
          <i className="fas fa-chart-line text-primary mr-2"></i>
          Dropshipping Dashboard
        </DialogTitle>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3">Loading orders...</span>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-success/10 to-success/20 p-4 rounded-lg">
                <div className="text-success text-2xl font-bold">${totalProfit.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Profit</div>
              </div>
              <div className="bg-gradient-to-r from-primary/10 to-primary/20 p-4 rounded-lg">
                <div className="text-primary text-2xl font-bold">{totalOrders}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="bg-gradient-to-r from-warning/10 to-warning/20 p-4 rounded-lg">
                <div className="text-warning text-2xl font-bold">{pendingOrders}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-gradient-to-r from-info/10 to-info/20 p-4 rounded-lg">
                <div className="text-info text-2xl font-bold">{completedOrders}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-shopping-bag text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600">Upload an image to find products and start earning profits!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      data-testid={`order-${order.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{order.productName}</h4>
                            {getStatusBadge(order.orderStatus)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Customer:</span><br/>
                              {order.customerEmail}
                            </div>
                            <div>
                              <span className="font-medium">Profit:</span><br/>
                              <span className="text-success font-bold">${order.profit}</span>
                            </div>
                            <div>
                              <span className="font-medium">Order Date:</span><br/>
                              {new Date(order.orderDate).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Tracking:</span><br/>
                              {order.trackingNumber || 'Pending'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI-Powered Features Info */}
            <div className="mt-6 bg-gradient-to-r from-primary/5 to-success/5 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                <i className="fas fa-robot text-primary mr-2"></i>
                AI-Powered Dropshipping Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <i className="fas fa-check text-success mr-2"></i>
                  Automatic global product sourcing
                </div>
                <div>
                  <i className="fas fa-check text-success mr-2"></i>
                  10% profit margin on all sales
                </div>
                <div>
                  <i className="fas fa-check text-success mr-2"></i>
                  Automated purchasing process
                </div>
                <div>
                  <i className="fas fa-check text-success mr-2"></i>
                  Real-time order tracking
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}