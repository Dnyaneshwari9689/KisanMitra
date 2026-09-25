import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="We'll send you a link to reset your password">
      {success ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-600" />
          </div>
          <p className="text-sm text-gray-700 mb-6">
            We've sent a password reset link to <span className="font-medium">{email}</span>. Check your inbox.
          </p>
          <Link to="/login">
            <Button fullWidth size="lg">Back to Login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      )}
      <p className="text-center text-sm text-gray-500 mt-6">
        Remembered your password?{' '}
        <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
