import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const apiCall = isRegister ? authAPI.register : authAPI.login;
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const res = await apiCall(payload);
      login(res.data.data.user, res.data.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-gray-600 text-center mt-2 text-sm">
          {isRegister ? 'Register to start shopping' : 'Login to your ShopHub account'}
        </p>

        {!isRegister && (
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-3 mt-4 text-sm">
            <p className="font-medium text-primary-800">Demo Credentials:</p>
            <p className="text-primary-700">Email: demo@college.edu</p>
            <p className="text-primary-700">Password: password123</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="text-primary-600 font-medium hover:underline"
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>

        <Link to="/" className="block text-center mt-4 text-sm text-gray-500 hover:text-primary-600">
          Continue as guest (browse only)
        </Link>
      </div>
    </div>
  );
}
