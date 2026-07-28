'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RecordsTable } from '@/components/records/RecordsTable';
import { ManualEntryForm } from '@/components/records/ManualEntryForm';
import { CSVUploadWizard } from '@/components/records/CSVUploadWizard';
import { Database, PlusCircle, Upload, Table, Sparkles, CheckCircle2, UserCheck, Briefcase } from 'lucide-react';

export default function RecordsManagementPage() {
  const [activeTab, setActiveTab] = useState<'table' | 'manual' | 'csv'>('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
        {/* Page Title & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="text-blue-600" size={26} /> Placement Records Management
            </h1>
            {/* <p className="text-xs text-gray-400 mt-1">
              Admin management system. Search, filter, add candidates, and run CSV imports.
            </p> */}
          </div>

          {/* Navigation Pill Switcher */}
          <div className="inline-flex p-1 bg-gray-100/80 rounded-xl border border-gray-200/60 shrink-0">
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table size={16} /> All Records Dashboard
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'manual'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PlusCircle size={16} /> Manual Candidate Entry
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'csv'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload size={16} /> Bulk CSV Import
            </button>
          </div>
        </div>

        {/* Tab 1: Records Table */}
        {activeTab === 'table' && <RecordsTable refreshTrigger={refreshTrigger} />}

        {/* Tab 2: Manual Form Entry */}
        {activeTab === 'manual' && (
          <ManualEntryForm
            onSuccess={() => {
              triggerRefresh();
              setActiveTab('table');
            }}
          />
        )}

        {/* Tab 3: CSV Import Wizard */}
        {activeTab === 'csv' && (
          <CSVUploadWizard
            onImportComplete={() => {
              triggerRefresh();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
