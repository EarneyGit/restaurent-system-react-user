import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from '@/config/axios.config';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useGuestCart } from '@/context/GuestCartContext';
import { toast } from 'sonner';
import ProductOptionsModal from '@/components/modals/ProductOptionsModal';
import { ProductAttribute } from '@/services/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images?: string[];
  category: string;
  attributes?: ProductAttribute[];
}

const ProductPage = () => {
  const { outletId } = useParams();
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get('branchId') || outletId;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { sessionId } = useGuestCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!branchId) {
          navigate('/select-outlet');
          return;
        }

        const response = await axios.get(`/api/products`, {
          params: {
            branchId: branchId
          }
        });
        
        if (response.data?.success) {
          setProducts(response.data.data);
        } else {
          toast.error('Failed to load products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [branchId, navigate]);

  const handleAddToCart = (product: Product) => {
    // Check if user is authenticated or has a guest session
    const hasGuestSession = sessionId && localStorage.getItem('isGuest') === 'true';
    
    if (!isAuthenticated && !hasGuestSession) {
      // Initialize guest session
      localStorage.setItem('isGuest', 'true');
      const newSessionId = uuidv4();
      localStorage.setItem('guestSessionId', newSessionId);
    }

    // If product has options, show the modal
    if (product.attributes && product.attributes.length > 0) {
      setSelectedProduct(product);
      setShowOptionsModal(true);
      return;
    }

    // Add to cart directly if no options
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: {
        base: product.price,
        currentEffectivePrice: product.price,
        attributes: 0,
        total: product.price
      },
      images: product.images,
      quantity: 1,
      category: product.category,
      branchId: branchId || ''
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleOptionsSubmit = (selectedOptions: Record<string, string>, specialRequirements: string) => {
    if (!selectedProduct) return;

    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      description: selectedProduct.description,
      price: {
        base: selectedProduct.price,
        currentEffectivePrice: selectedProduct.price,
        attributes: 0,
        total: selectedProduct.price
      },
      images: selectedProduct.images,
      quantity: 1,
      category: selectedProduct.category,
      branchId: branchId || '',
      selectedOptions,
      specialRequirements,
      attributes: selectedProduct.attributes
    });
    toast.success(`${selectedProduct.name} added to cart`);
    setShowOptionsModal(false);
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <ProductOptionsModal
          isOpen={showOptionsModal}
          onClose={() => {
            setShowOptionsModal(false);
            setSelectedProduct(null);
          }}
          onAddToCart={handleOptionsSubmit}
          productName={selectedProduct.name}
          options={selectedProduct.attributes || []}
          productId={selectedProduct.id}
        />
      )}
    </>
  );
};

export default ProductPage; 