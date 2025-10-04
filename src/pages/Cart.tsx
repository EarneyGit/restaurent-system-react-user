import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function CartPage() {
  const { cartItems, removeFromCart, updateCartItemQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed with checkout');
      // Store the return URL in localStorage
      localStorage.setItem('returnUrl', '/checkout');
      router.push('/login');
      return;
    }
    
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... existing cart items display code ... */}

      {cartItems.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleProceedToCheckout}
            className="bg-yellow-700 text-white px-6 py-3 rounded-xl hover:bg-yellow-700 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
} 