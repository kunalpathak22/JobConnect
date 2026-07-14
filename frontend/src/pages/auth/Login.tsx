import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, userId, name, role, status } = response.data;
      
      login(token, { userId, name, email: response.data.email, role, status });
      
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'EMPLOYER') {
        navigate('/employer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const detailStr = Object.entries(err.response.data.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(' | ');
          setError(detailStr);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
          if (err.response.data.message.includes('verify your email')) {
            setTimeout(() => {
              navigate(`/verify-email?email=${encodeURIComponent(email)}`);
            }, 2500);
          }
        } else {
          setError('Login failed. Please verify your credentials and connection.');
        }
      } else {
        setError('Login failed. Please verify your credentials and connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-500">Sign in to manage your applications and jobs</p>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-rose-700 font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-11 pr-4 py-3 rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-600">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-11 pr-4 py-3 rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 disabled:bg-slate-300 disabled:shadow-none transition-all"
          >
            {loading ? <span>Logging in...</span> : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 text-xs">
          <span className="text-slate-400">New to JobConnect? </span>
          <Link
            to="/register"
            className="font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
