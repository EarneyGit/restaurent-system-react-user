import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package2, Clock, MapPin, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Product {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
  notes?: string;
  selectedAttributes: Array<{
    name: string;
    value: string;
  }>;
}

interface Order {
  _id: string;
  orderNumber: string;
  branchId: {
    _id: string;
    name: string;
    address: string;
  };
  products: Product[];
  status: 'processing' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  paymentMethod: 'card' | 'cash';
  orderType: 'delivery' | 'pickup';
  createdAt: string;
  updatedAt: string;
}

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchOrders = async () => {
      try {
        // Simulated API call
        const response = {
          success: true,
          data: [
            {
              "_id": "65f7c8e12b67f123456789ab",
              "orderNumber": "ORD-2024-001",
              "branchId": {
                "_id": "65f7c8e12b67f123456789ef",
                "name": "Downtown Branch",
                "address": "123 Main Street"
              },
              "products": [
                {
                  "product": {
                    "_id": "65f7c8e12b67f123456789gh",
                    "name": "Margherita Pizza",
                    "price": 12.99
                  },
                  "quantity": 2,
                  "price": 12.99,
                  "notes": "Extra cheese",
                  "selectedAttributes": [
                    {
                      "name": "Size",
                      "value": "Large"
                    }
                  ]
                }
              ],
              "status": "delivered",
              "totalAmount": 25.98,
              "deliveryAddress": {
                "street": "456 Oak Avenue",
                "city": "New York",
                "state": "NY",
                "postalCode": "10001"
              },
              "paymentMethod": "card",
              "orderType": "delivery",
              "createdAt": "2024-03-17T14:30:00.000Z",
              "updatedAt": "2024-03-17T15:30:00.000Z"
            },
            {
              "_id": "65f7c8e12b67f123456789ij",
              "orderNumber": "ORD-2024-002",
              "branchId": {
                "_id": "65f7c8e12b67f123456789ef",
                "name": "Downtown Branch",
                "address": "123 Main Street"
              },
              "products": [
                {
                  "product": {
                    "_id": "65f7c8e12b67f123456789kl",
                    "name": "Chicken Wings",
                    "price": 9.99
                  },
                  "quantity": 1,
                  "price": 9.99,
                  "notes": "Spicy",
                  "selectedAttributes": []
                }
              ],
              "status": "processing",
              "totalAmount": 9.99,
              "orderType": "pickup",
              "paymentMethod": "cash",
              "createdAt": "2024-03-17T16:30:00.000Z",
              "updatedAt": "2024-03-17T16:30:00.000Z"
            }
          ]
        };
        
        setOrders(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="text-green-500" size={20} />;
      case 'processing':
        return <Clock className="text-yellow-500" size={20} />;
      case 'cancelled':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-green-500 transition-colors"
              >
                {/* Order Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-4">
                  {/* Products */}
                  <div className="space-y-2">
                    {order.products.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.quantity}x {item.product.name}
                          </p>
                          {item.selectedAttributes.map((attr, i) => (
                            <p key={i} className="text-sm text-gray-500">
                              {attr.name}: {attr.value}
                            </p>
                          ))}
                          {item.notes && (
                            <p className="text-sm text-gray-500">Note: {item.notes}</p>
                          )}
                        </div>
                        <p className="font-medium text-gray-900">
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500">
                      {order.orderType === 'delivery' ? (
                        <>
                          <Truck size={18} />
                          <span className="text-sm">
                            Delivery to: {order.deliveryAddress?.street},{' '}
                            {order.deliveryAddress?.city}
                          </span>
                        </>
                      ) : (
                        <>
                          <MapPin size={18} />
                          <span className="text-sm">
                            Pickup from: {order.branchId.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-green-600">
                      £{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 