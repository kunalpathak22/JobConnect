import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Briefcase, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'JOB_SEEKER' | 'EMPLOYER'>('JOB_SEEKER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Employer optional fields
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [website, setWebsite] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      role,
      ...(role === 'EMPLOYER' ? { companyName, companyDescription, website } : {})
    };

    try {
      const response = await api.post('/auth/register', payload);
      
      setSuccess('Registration successful! A 6-character verification code has been sent to your email.');
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const detailStr = Object.entries(err.response.data.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(' | ');
          setError(detailStr);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Registration failed. Please check inputs and try again.');
        }
      } else {
        setError('Registration failed. Please check inputs and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create an Account</h2>
          <p className="text-sm text-slate-500">Choose your track and join JobConnect today</p>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-rose-700 font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-emerald-700 font-medium">{success}</span>
          </div>
        )}

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('JOB_SEEKER')}
            className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              role === 'JOB_SEEKER'
                ? 'bg-white text-brand-600 shadow'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Job Seeker</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('EMPLOYER')}
            className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              role === 'EMPLOYER'
                ? 'bg-white text-brand-600 shadow'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Employer</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="pl-11 pr-4 py-3 rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-11 pr-4 py-3 rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-11 pr-4 py-3 rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
                />
              </div>
            </div>

            {/* Conditional Employer Fields */}
            {role === 'EMPLOYER' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="TechCorp LLC"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Company Description</label>
                  <textarea
                    placeholder="Short description of core focus..."
                    value={companyDescription}
                    onChange={e => setCompanyDescription(e.target.value)}
                    rows={3}
                    className="px-4 py-3 rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://techcorp.com"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 disabled:bg-slate-300 disabled:shadow-none transition-all"
          >
            {loading ? <span>Processing Registration...</span> : <span>Create Account</span>}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 text-xs">
          <span className="text-slate-400">Already registered? </span>
          <Link
            to="/login"
            className="font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
