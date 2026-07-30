import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.productId}`} className="card hover:shadow-md transition-shadow group">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <span className="text-xs text-primary-600 font-medium uppercase tracking-wide">{product.category}</span>
        <h3 className="font-semibold text-gray-900 mt-1 truncate">{product.name}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-lg font-bold text-primary-600">${product.price.toFixed(2)}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${product.quantityAvailable > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {product.quantityAvailable > 0 ? `${product.quantityAvailable} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </Link>
  );
}
