'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { PlacementRecord, PlacementRecordUpdate } from '@/lib/supabase/types';
import { fetchPlacementRecords, updatePlacementRecord, deletePlacementRecord } from '@/app/actions/records';
import { ZONES, CENTRES, COURSES, NATURE_OF_EMPLOYMENT, BATCH_YEARS } from '@/lib/constants';
import { isValidPhone } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  Building,
  GraduationCap,
  Calendar,
  Briefcase,
  UserCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function RecordsTable({ refreshTrigger }: { refreshTrigger?: number }) {
  const [records, setRecords] = useState<PlacementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCentre, setSelectedCentre] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedNature, setSelectedNature] = useState('all');
  const [selectedBatchYear, setSelectedBatchYear] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals & Action States
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<PlacementRecord | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPlacementRecords({
        search,
        zone: selectedZone,
        centre: selectedCentre,
        course_name: selectedCourse,
        nature_of_employment: selectedNature,
        batch_completion_year: selectedBatchYear,
        page,
        pageSize,
      });

      if (res.error) {
        toast.error(`Error loading records: ${res.error}`);
      } else {
        setRecords(res.data);
        setTotalCount(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, [search, selectedZone, selectedCentre, selectedCourse, selectedNature, selectedBatchYear, page]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  // Reset page when filters change
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val);
    setPage(1);
  };

  // Delete Record
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await deletePlacementRecord(deletingId);
      if (res.success) {
        toast.success('Placement record deleted successfully.');
        loadData();
      } else {
        toast.error(res.error || 'Failed to delete record.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred while deleting.');
    } finally {
      setDeletingId(null);
    }
  };

  // Update Record
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (!editingRecord.contact_number || !isValidPhone(editingRecord.contact_number)) {
      toast.error('Enter a valid 10-digit contact number.');
      return;
    }
    setIsSavingEdit(true);
    try {
      const res = await updatePlacementRecord(editingRecord.id, editingRecord as PlacementRecordUpdate);
      if (res.success) {
        toast.success(`Updated record for ${editingRecord.full_name}`);
        setEditingRecord(null);
        loadData();
      } else {
        toast.error(res.error || 'Failed to update record.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred while updating.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Export filtered dataset to CSV
  const handleExportCSV = async () => {
    toast.info('Preparing CSV export of filtered records...');
    const fullRes = await fetchPlacementRecords({
      search,
      zone: selectedZone,
      centre: selectedCentre,
      course_name: selectedCourse,
      nature_of_employment: selectedNature,
      batch_completion_year: selectedBatchYear,
      page: 1,
      pageSize: 5000, // Export up to 5000 records
    });

    if (fullRes.data.length === 0) {
      toast.warning('No records to export.');
      return;
    }

    const csvData = fullRes.data.map((r) => ({
      'Full Name': r.full_name,
      'Contact Number': r.contact_number,
      Email: r.email,
      Age: r.age ?? '',
      'Date of Birth': r.date_of_birth ?? '',
      'Current Location': r.current_location ?? '',
      Qualification: r.qualification ?? '',
      Zone: r.zone ?? '',
      Centre: r.centre ?? '',
      'Course Name': r.course_name ?? '',
      'Batch Month': r.batch_completion_month ?? '',
      'Batch Year': r.batch_completion_year ?? '',
      'Technical Skills': r.technical_skills ?? '',
      'Work Experience': r.work_experience ?? '',
      'Employment Type': r.nature_of_employment ?? '',
      'Preferred Job Role': r.preferred_job_role ?? '',
      'Preferred Location': r.preferred_location ?? '',
      'Expected Package / Salary': r.expected_salary_stipend ?? '',
      Source: r.source,
      'Created At': r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
    }));

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `placement_records_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${fullRes.data.length} records to CSV.`);
  };

  // Filter options for Centres depending on selected Zone
  const availableCentresFilter =
    selectedZone !== 'all' && CENTRES[selectedZone] ? CENTRES[selectedZone] : Object.values(CENTRES).flat();

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              placeholder="Search by name, email, contact, skills..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              title="Refresh table"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <Download size={14} /> Export Filtered CSV
            </button>
          </div>
        </div>

        {/* Multi-Filter Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-gray-100 text-xs">
          {/* Zone Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => handleFilterChange(setSelectedZone, e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800"
            >
              <option value="all">All Zones</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          {/* Centre Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Centre</label>
            <select
              value={selectedCentre}
              onChange={(e) => handleFilterChange(setSelectedCentre, e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800"
            >
              <option value="all">All Centres</option>
              {availableCentresFilter.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => handleFilterChange(setSelectedCourse, e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800"
            >
              <option value="all">All Courses</option>
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Nature Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Employment</label>
            <select
              value={selectedNature}
              onChange={(e) => handleFilterChange(setSelectedNature, e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800"
            >
              <option value="all">All Types</option>
              {NATURE_OF_EMPLOYMENT.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Year Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Batch Year</label>
            <select
              value={selectedBatchYear}
              onChange={(e) => handleFilterChange(setSelectedBatchYear, e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800"
            >
              <option value="all">All Batch Years</option>
              {BATCH_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="text-sm font-medium text-gray-500">Loading records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <UserCheck size={40} className="mx-auto text-gray-300" />
            <p className="text-base font-bold text-gray-800">No Placement Records Found</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No matching records in `placement_records`. Try resetting your search filters or add records via Manual Entry / CSV Upload.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Candidate Info</th>
                  <th className="px-4 py-3.5">Zone & Centre</th>
                  <th className="px-4 py-3.5">Course & Batch</th>
                  <th className="px-4 py-3.5">Employment Nature</th>
                  <th className="px-4 py-3.5">Skills & Preference</th>
                  <th className="px-4 py-3.5">Source</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Candidate Info */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-gray-900 text-sm">{r.full_name}</div>
                      <div className="text-gray-500 text-[11px]">{r.email}</div>
                      <div className="text-gray-400 text-[11px] font-mono">{r.contact_number}</div>
                    </td>

                    {/* Zone & Centre */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-gray-800">{r.centre || '-'}</div>
                      <div className="text-gray-400 text-[11px]">{r.zone || '-'}</div>
                    </td>

                    {/* Course & Batch */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-gray-800">{r.course_name || '-'}</div>
                      <div className="text-gray-400 text-[11px]">
                        {r.batch_completion_month || ''} {r.batch_completion_year || ''}
                      </div>
                    </td>

                    {/* Nature of Employment */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          r.nature_of_employment === 'Full-Time'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : r.nature_of_employment === 'Internship'
                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {r.nature_of_employment || 'Full-Time'}
                      </span>
                    </td>

                    {/* Skills & Preference */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="truncate text-gray-700 font-medium" title={r.technical_skills || ''}>
                        {r.technical_skills || '-'}
                      </div>
                      <div className="text-gray-400 text-[11px] truncate">
                        Role: {r.preferred_job_role || 'Any'}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                        {r.source || 'manual'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <Link
                        href={`/dashboard/records/profile?email=${encodeURIComponent(r.email)}`}
                        className="inline-flex p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors"
                        title="View profile — documents & job applications"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => setEditingRecord(r)}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Edit record"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingId(r.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-xs text-gray-500">
          <div>
            Showing {records.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(page * pageSize, totalCount)} of {totalCount} records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-gray-800">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Placement Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Record Modal Dialog */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-gray-100 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Edit Candidate Record</h3>
              <button onClick={() => setEditingRecord(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingRecord.full_name}
                    onChange={(e) => setEditingRecord({ ...editingRecord, full_name: e.target.value })}
                    required
                    className="w-full p-2 bg-gray-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingRecord.email}
                    onChange={(e) => setEditingRecord({ ...editingRecord, email: e.target.value })}
                    required
                    className="w-full p-2 bg-gray-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={editingRecord.contact_number}
                    onChange={(e) => setEditingRecord({ ...editingRecord, contact_number: e.target.value })}
                    required
                    className="w-full p-2 bg-gray-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={editingRecord.age ?? ''}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        age: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full p-2 bg-gray-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Zone</label>
                  <select
                    value={editingRecord.zone ?? 'North Zone'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, zone: e.target.value })}
                    className="w-full p-2 bg-gray-50 border rounded-lg"
                  >
                    {ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Centre</label>
                  <input
                    type="text"
                    value={editingRecord.centre ?? ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, centre: e.target.value })}
                    className="w-full p-2 bg-gray-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Course Name</label>
                  <input
                    type="text"
                    value={editingRecord.course_name ?? ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, course_name: e.target.value })}
                    className="w-full p-2 bg-gray-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={editingRecord.nature_of_employment ?? 'Full-Time'}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        nature_of_employment: e.target.value as any,
                      })
                    }
                    className="w-full p-2 bg-gray-50 border rounded-lg font-bold text-blue-700"
                  >
                    {NATURE_OF_EMPLOYMENT.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Technical Skills</label>
                <textarea
                  rows={2}
                  value={editingRecord.technical_skills ?? ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, technical_skills: e.target.value })}
                  className="w-full p-2 bg-gray-50 border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingEdit ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
