import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryAPI.getProduct(productId)
      .then((res) => setProduct(res.data.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [productId, navigate]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card aspect-square">
          <img
            src={product.image || 'https://via.placeholder.com/600'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <span className="text-sm text-primary-600 font-medium uppercase">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
          <p className="text-gray-600 mt-4">{product.description}</p>
          <p className="text-3xl font-bold text-primary-600 mt-6">${product.price.toFixed(2)}</p>
          <p className={`mt-2 text-sm ${product.quantityAvailable > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.quantityAvailable > 0
              ? `${product.quantityAvailable} units available`
              : 'Currently out of stock'}
          </p>

          {product.quantityAvailable > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >-</button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.quantityAvailable, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex-1">
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
