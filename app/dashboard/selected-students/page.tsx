'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { SelectedStudentsTable } from '@/components/records/SelectedStudentsTable';
import { CheckCircle2 } from 'lucide-react';

export default function SelectedStudentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="text-blue-600" size={26} /> Selected Students
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Students who've been selected or joined, with proof of joining status.</p>
        </div>

        <SelectedStudentsTable />
      </div>
    </DashboardLayout>
  );
}
