import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/AuthLayout';
import { Button, Input } from '@/components/ui';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout title="Welcome" subtitle="Sign in to access your dashboard">
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
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
