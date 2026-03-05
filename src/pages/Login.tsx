import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';
import SuccessToast from '../components/SuccessToast';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      setSuccessMessage(result.message || 'Login Successful');
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(result.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signup(email, password);
    
    if (result.success) {
      setSuccessMessage(result.message || 'Admin Created Successfully');
      setShowSuccess(true);
      setLoading(false);
      // Clear form after successful signup
      setTimeout(() => {
        setEmail('');
        setPassword('');
        setActiveTab('login');
        setShowSuccess(false);
      }, 2000);
    } else {
      setError(result.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = activeTab === 'login' ? handleLogin : handleSignup;

  const switchTab = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {showSuccess && (
        <SuccessToast
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-semibold transition-all ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LogIn className="w-5 h-5" />
              Login
            </button>
            <button
              type="button"
              onClick={() => switchTab('signup')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-semibold transition-all ${
                activeTab === 'signup'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              Sign Up
            </button>
          </div>

          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
              activeTab === 'login' ? 'bg-blue-600' : 'bg-green-600'
            }`}>
              {activeTab === 'login' ? (
                <LogIn className="w-8 h-8 text-white" />
              ) : (
                <UserPlus className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {activeTab === 'login'
                ? 'Sign in to access your dashboard'
                : 'Register a new admin account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition shadow-lg ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {activeTab === 'login' ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                activeTab === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
