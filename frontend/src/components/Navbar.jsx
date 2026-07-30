import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-600">ShopHub</span>
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Microservices</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">Home</Link>
            {isAuthenticated && (
              <Link to="/orders" className="text-gray-600 hover:text-primary-600 transition-colors">Orders</Link>
            )}
            <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors">
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Hi, {user.name}</span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-1.5">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
