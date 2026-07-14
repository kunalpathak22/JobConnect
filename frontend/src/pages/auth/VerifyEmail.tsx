import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email') || '';
    setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (code.length < 4) {
      setError('Please enter the full verification code.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/verify-email', { email, code: code.toUpperCase() });
      setSuccess(response.data.message || 'Email verified successfully!');
      
      // Delay navigation to let user read success message
      setTimeout(() => {
        navigate('/login', { state: { message: 'Email verified successfully! You can now log in.' } });
      }, 3000);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Verification failed. Please check the code and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email address is missing.');
      return;
    }

    setResending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/auth/resend-verification', { email });
      setSuccess(response.data.message || 'A new verification code has been sent to your email.');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to resend verification code. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verify Your Email</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            We sent a 6-character authentication code to <span className="font-semibold text-slate-800 break-all">{email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-rose-700 font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-emerald-700 font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email Field (Disabled) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  disabled
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-11 pr-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50 text-sm w-full outline-none text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Verification Code */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">6-Character Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter Code (e.g. A3F8K9)"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-center tracking-widest font-mono text-lg font-bold w-full outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 disabled:bg-slate-300 disabled:shadow-none transition-all"
          >
            {loading ? <span>Verifying Code...</span> : <span>Verify and Activate</span>}
          </button>
        </form>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs">
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center space-x-1 font-bold text-brand-600 hover:text-brand-700 disabled:text-slate-400 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
            <span>{resending ? 'Resending...' : 'Resend Code'}</span>
          </button>

          <Link
            to="/login"
            className="font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
