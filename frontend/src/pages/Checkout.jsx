import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';

const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'NET_BANKING', label: 'Net Banking' }
];

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderAPI.createOrder({
        products: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod
      });

      clearCart();
      const orderId = response.data.data.order.orderId;
      navigate('/orders', { state: { newOrderId: orderId } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between py-2 border-b last:border-0">
            <span>{item.name} x {item.quantity}</span>
            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between mt-4 text-lg font-bold">
          <span>Total</span>
          <span className="text-primary-600">${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => (
            <label key={method.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-primary-600"
              />
              <span>{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="btn-primary w-full py-3 text-lg"
      >
        {loading ? 'Processing Order...' : `Place Order - $${totalAmount.toFixed(2)}`}
      </button>

      <p className="text-sm text-gray-500 text-center mt-4">
        Order will be processed through Order, Payment, Inventory & Notification microservices
      </p>
    </div>
  );
}
