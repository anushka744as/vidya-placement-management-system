'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { fetchSelectedStudentsAdmin, getApplicationProofSignedUrls, SelectedStudentSummary } from '@/app/actions/portal';
import { toast } from 'sonner';
import { Loader2, Building2, AlertCircle, Eye, RefreshCw, CheckCircle2, Download } from 'lucide-react';

export function SelectedStudentsTable() {
  const [rows, setRows] = useState<SelectedStudentSummary[]>([]);
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchSelectedStudentsAdmin();
      if (res.error) {
        toast.error(`Error loading selected students: ${res.error}`);
      }
      setRows(res.data);

      const withProof = res.data.filter((r) => r.proof_document_url);
      if (withProof.length > 0) {
        const { urls } = await getApplicationProofSignedUrls(withProof.map((r) => r.proof_document_url!));
        const entries = withProof
          .map((r) => [r.id, urls[r.proof_document_url!]] as const)
          .filter(([, url]) => !!url);
        setProofUrls(Object.fromEntries(entries) as Record<string, string>);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch selected students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    if (rows.length === 0) {
      toast.warning('No placed students to export.');
      return;
    }

    const csvData = rows.map((r) => ({
      'Student Name': r.student_name,
      'Student Email': r.student_email,
      Company: r.company_name,
      'Job Title': r.job_title,
      Designation: r.designation ?? '',
      Status: r.status,
      'Joining Date': r.joining_date ? new Date(r.joining_date).toLocaleDateString() : '',
      'Proof of Joining': r.proof_document_url ? 'Uploaded' : 'Not uploaded',
    }));

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `placed_students_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} placed students to CSV.`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-gray-900">Selected Students & Proof of Joining</h3>
          <p className="text-xs text-gray-500 mt-0.5">Everyone marked Selected or Joined, with their proof of joining status.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={loadData}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 size={28} className="mx-auto animate-spin text-blue-600" />
          <p className="mt-3 text-sm font-medium text-gray-500">Loading selected students...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <CheckCircle2 size={32} className="mx-auto text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No students have been marked Selected yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Company</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Proof of Joining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <Link href={`/dashboard/records/profile?email=${encodeURIComponent(r.student_email)}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                      {r.student_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1.5 font-medium text-gray-800"><Building2 size={12} className="text-gray-400" /> {r.company_name}</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{r.designation || r.job_title || '—'}</td>
                  <td className="px-4 py-3.5">
                    {proofUrls[r.id] ? (
                      <a
                        href={proofUrls[r.id]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                      >
                        <Eye size={11} /> View Proof
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertCircle size={11} /> Not uploaded
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
