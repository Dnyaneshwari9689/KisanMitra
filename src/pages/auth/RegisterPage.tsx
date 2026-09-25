import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/AuthLayout';
import { Button, Input } from '@/components/ui';
import type { UserRole } from '@/types';
import { AlertCircle, Tractor, Store, Check } from 'lucide-react';

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('farmer');
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const extraFields: Record<string, string> = {};
    if (role === 'farmer') {
      extraFields.village = form.village ?? '';
      extraFields.district = form.district ?? '';
      extraFields.state = form.state ?? '';
      extraFields.pincode = form.pincode ?? '';
    } else {
      extraFields.businessName = form.businessName ?? '';
      extraFields.ownerName = form.ownerName ?? '';
      extraFields.businessLocation = form.businessLocation ?? '';
      extraFields.buyerType = form.buyerType ?? 'Wholesaler';
    }

    const { error } = await signUp(
      form.email ?? '',
      form.password ?? '',
      role === 'farmer' ? (form.fullName ?? '') : (form.ownerName ?? ''),
      role,
      form.mobile ?? '',
      extraFields,
    );

    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/dashboard');
    }
  };

  const buyerTypes = ['Wholesaler', 'Retailer', 'Processor', 'Exporter', 'FPO', 'Other'];
  const states = ['Maharashtra', 'Gujarat', 'Karnataka', 'Telangana', 'Madhya Pradesh', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh', 'Other'];

  return (
    <AuthLayout title="Create Account" subtitle="Join KisanMitra and start making smarter selling decisions">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Role selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">I am a...</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                role === 'farmer' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Tractor size={20} />
              <span className="text-sm font-medium">Farmer</span>
              {role === 'farmer' && <Check size={16} className="ml-auto" />}
            </button>
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                role === 'buyer' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Store size={20} />
              <span className="text-sm font-medium">Buyer</span>
              {role === 'buyer' && <Check size={16} className="ml-auto" />}
            </button>
          </div>
        </div>

        {role === 'farmer' ? (
          <>
            <Input label="Full Name" name="fullName" value={form.fullName ?? ''} onChange={set('fullName')} required placeholder="Rajesh Patil" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Mobile Number" name="mobile" type="tel" value={form.mobile ?? ''} onChange={set('mobile')} required placeholder="9876543210" />
              <Input label="Email" name="email" type="email" value={form.email ?? ''} onChange={set('email')} required placeholder="you@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Village" name="village" value={form.village ?? ''} onChange={set('village')} required placeholder="Niphad" />
              <Input label="District" name="district" value={form.district ?? ''} onChange={set('district')} required placeholder="Nashik" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">State <span className="text-rose-500">*</span></label>
                <select
                  name="state"
                  value={form.state ?? ''}
                  onChange={set('state')}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">Select State</option>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label="Pincode" name="pincode" value={form.pincode ?? ''} onChange={set('pincode')} required placeholder="422209" />
            </div>
          </>
        ) : (
          <>
            <Input label="Business Name" name="businessName" value={form.businessName ?? ''} onChange={set('businessName')} required placeholder="FreshMart Wholesale" />
            <Input label="Owner Name" name="ownerName" value={form.ownerName ?? ''} onChange={set('ownerName')} required placeholder="Amit Sharma" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Mobile" name="mobile" type="tel" value={form.mobile ?? ''} onChange={set('mobile')} required placeholder="9876543210" />
              <Input label="Email" name="email" type="email" value={form.email ?? ''} onChange={set('email')} required placeholder="you@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Business Location" name="businessLocation" value={form.businessLocation ?? ''} onChange={set('businessLocation')} required placeholder="Pune, Maharashtra" />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Buyer Type <span className="text-rose-500">*</span></label>
                <select
                  name="buyerType"
                  value={form.buyerType ?? ''}
                  onChange={set('buyerType')}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">Select Type</option>
                  {buyerTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Password" name="password" type="password" value={form.password ?? ''} onChange={set('password')} required placeholder="••••••••" />
          <Input label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword ?? ''} onChange={set('confirmPassword')} required placeholder="•••••••••" />
        </div>

        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
