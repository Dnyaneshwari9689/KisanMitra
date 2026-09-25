import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Badge } from '@/components/ui';
import { Settings, Database, Shield, Server } from 'lucide-react';

export function AdminSettings() {
  return (
    <DashboardLayout>
      <PageHeader title="Settings" subtitle="Platform configuration" />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Platform Info" icon={<Settings size={18} />} />
          <CardBody>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Platform Name</span>
                <span className="font-medium text-gray-900">AgriLink</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Version</span>
                <Badge variant="green">1.0.0</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ML Model</span>
                <Badge variant="amber">Mock (Demo)</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Real-time Data</span>
                <Badge variant="amber">Mock Data</Badge>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Database" icon={<Database size={18} />} />
          <CardBody>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Backend</span>
                <span className="font-medium text-gray-900">Supabase (PostgreSQL)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">RLS</span>
                <Badge variant="green">Enabled</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Auth</span>
                <span className="font-medium text-gray-900">Supabase Auth</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Storage</span>
                <span className="font-medium text-gray-900">Supabase Storage</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Security" icon={<Shield size={18} />} />
          <CardBody>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Row Level Security</span>
                <Badge variant="green">Active</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email Confirmation</span>
                <Badge variant="gray">Disabled</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Session Management</span>
                <Badge variant="green">PKCE Flow</Badge>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="ML API Configuration" icon={<Server size={18} />} />
          <CardBody>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ML API URL</span>
                <Badge variant="gray">Not configured</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Prediction Model</span>
                <span className="font-medium text-gray-900">Mock (seasonal)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Maps API</span>
                <Badge variant="gray">Not configured</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-3">Set VITE_ML_API_URL and VITE_MAPS_API_URL in .env to connect real services.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
