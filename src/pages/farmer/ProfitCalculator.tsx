import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Input, Button, Badge } from '@/components/ui';
import { calculateProfit, calculateTransportCost, getVehicleTypes } from '@/services/logistics';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export function ProfitCalculator() {
  const [form, setForm] = useState({
    quantity: '500',
    sellingPrice: '28',
    sourceLocation: 'Nashik',
    destination: 'Pune',
    vehicleType: 'Medium Truck (6-wheeler)',
    commission: '6',
    storageCost: '500',
    otherExpenses: '300',
  });

  const transport = calculateTransportCost(form.sourceLocation, form.destination, Number(form.quantity), form.vehicleType);
  const profit = calculateProfit(
    Number(form.quantity),
    Number(form.sellingPrice),
    transport.transport_cost,
    Number(form.commission),
    Number(form.storageCost),
    Number(form.otherExpenses),
  );

  const pieData = [
    { name: 'Transport', value: transport.transport_cost },
    { name: 'Commission', value: profit.breakdown.find((b) => b.label === 'Commission')?.amount ? -profit.breakdown.find((b) => b.label === 'Commission')!.amount : 0 },
    { name: 'Storage', value: Number(form.storageCost) },
    { name: 'Other', value: Number(form.otherExpenses) },
    { name: 'Net Profit', value: profit.netProfit > 0 ? profit.netProfit : 0 },
  ];

  const colors = ['#f59e0b', '#ef4444', '#8b5cf6', '#6b7280', '#059669'];

  const set = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [name]: e.target.value });

  return (
    <DashboardLayout>
      <PageHeader title="Profit Calculator" subtitle="Know your real profit after all costs" />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Inputs" icon={<Calculator size={18} />} />
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Quantity (kg)" type="number" name="quantity" value={form.quantity} onChange={set('quantity')} min={0} />
                <Input label="Selling Price (₹/kg)" type="number" name="sellingPrice" value={form.sellingPrice} onChange={set('sellingPrice')} min={0} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Source Location" name="sourceLocation" value={form.sourceLocation} onChange={set('sourceLocation')} />
                <Input label="Destination" name="destination" value={form.destination} onChange={set('destination')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Vehicle Type</label>
                <select value={form.vehicleType} onChange={set('vehicleType')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  {getVehicleTypes().map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Commission (%)" type="number" name="commission" value={form.commission} onChange={set('commission')} min={0} />
                <Input label="Storage Cost (₹)" type="number" name="storageCost" value={form.storageCost} onChange={set('storageCost')} min={0} />
                <Input label="Other Expenses (₹)" type="number" name="otherExpenses" value={form.otherExpenses} onChange={set('otherExpenses')} min={0} />
              </div>
              <div className="p-3 rounded-lg bg-gray-50 text-xs text-gray-600">
                <p>Transport: {transport.distance_km} km, ₹{transport.transport_cost.toLocaleString('en-IN')} (₹{transport.cost_per_kg}/kg), ~{transport.estimated_delivery_hours}h delivery</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <div className={`p-5 rounded-xl border-2 ${profit.netProfit > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-center gap-3">
              {profit.netProfit > 0 ? <TrendingUp size={28} className="text-emerald-600" /> : <TrendingDown size={28} className="text-rose-600" />}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Expected Net Profit</p>
                <p className={`text-3xl font-bold ${profit.netProfit > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>₹{profit.netProfit.toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-600">₹{profit.profitPerKg}/kg profit</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-xs text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 mt-1">₹{profit.totalRevenue.toLocaleString('en-IN')}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-gray-500">Total Expenses</p>
              <p className="text-xl font-bold text-rose-700 mt-1">₹{profit.totalExpenses.toLocaleString('en-IN')}</p>
            </Card>
          </div>

          <Card>
            <CardHeader title="Profit Breakdown" />
            <CardBody>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {pieData.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {profit.breakdown.map((b, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-500">{b.label}</span>
                    <span className={b.amount < 0 || b.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}>₹{Math.abs(b.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-100">
                  <span>Net Profit</span>
                  <Badge variant={profit.netProfit > 0 ? 'green' : 'red'}>₹{profit.netProfit.toLocaleString('en-IN')}</Badge>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
