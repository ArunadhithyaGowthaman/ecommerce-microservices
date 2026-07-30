import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { orderAPI, notificationAPI } from '../services/api';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',
  PAYMENT_FAILED: 'bg-red-100 text-red-800'
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const location = useLocation();
  const newOrderId = location.state?.newOrderId;

  const fetchData = async () => {
    try {
      const [ordersRes, notifRes] = await Promise.all([
        orderAPI.getMyOrders(),
        notificationAPI.getMyNotifications()
      ]);
      setOrders(ordersRes.data.data);
      setNotifications(notifRes.data.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = async (orderId) => {
    setCancelling(orderId);
    try {
      await orderAPI.cancelOrder(orderId);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

      {newOrderId && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
          Order {newOrderId} placed successfully! Check notifications below.
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-600 text-center py-12">No orders yet. Start shopping!</p>
      ) : (
        <div className="space-y-4 mb-12">
          {orders.map((order) => (
            <div key={order.orderId} className="card p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{order.orderId}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.orderStatus]}`}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {order.products.map((p) => (
                  <div key={p.productId} className="flex justify-between text-sm">
                    <span>{p.productId} x {p.quantity}</span>
                    <span>${(p.price * p.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="font-bold text-primary-600">${order.totalAmount.toFixed(2)}</span>
                {['PENDING', 'CONFIRMED'].includes(order.orderStatus) && (
                  <button
                    onClick={() => handleCancel(order.orderId)}
                    disabled={cancelling === order.orderId}
                    className="text-red-600 text-sm hover:underline disabled:opacity-50"
                  >
                    {cancelling === order.orderId ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.notificationId} className="card p-4 flex justify-between items-center">
              <div>
                <p className="text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${n.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {n.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
