'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { useAuth } from '@/components/auth/AuthProvider';
import { FIELD_DEFINITIONS, NATURE_OF_EMPLOYMENT } from '@/lib/constants';
import { bulkInsertPlacementRecords, BulkInsertResult } from '@/app/actions/records';
import { PlacementRecordInsert, NatureOfEmployment } from '@/lib/supabase/types';
import { toast } from 'sonner';
import {
  Upload,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Database,
  Loader2,
  Table,
  Check,
  ChevronRight,
  Sliders,
} from 'lucide-react';

interface ParsedRow {
  rowIndex: number;
  raw: Record<string, any>;
  mapped: Record<string, any>;
  isValid: boolean;
  errors: string[];
}

export function CSVUploadWizard({ onImportComplete }: { onImportComplete?: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'summary'>('upload');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);

  // Mapping state: key = db field key, value = CSV header name
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Parsed and validated rows
  const [validatedRows, setValidatedRows] = useState<ParsedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<BulkInsertResult | null>(null);

  // Handle CSV file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a valid .csv file.');
        return;
      }
      parseCSVFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.csv')) {
        toast.error('Please upload a valid .csv file.');
        return;
      }
      parseCSVFile(droppedFile);
    }
  };

  const parseCSVFile = (csvFile: File) => {
    setFile(csvFile);
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          toast.error('Failed to parse CSV file.');
          return;
        }

        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        setRawRows(results.data as Record<string, any>[]);

        // Auto-match CSV headers to DB fields based on aliases
        const initialMapping: Record<string, string> = {};
        FIELD_DEFINITIONS.forEach((field) => {
          const matchedHeader = headers.find((h) => {
            const normalizedH = h.toLowerCase().trim().replace(/[\s_\-]+/g, '_');
            return field.aliases.some((alias) => alias.toLowerCase() === normalizedH);
          });
          if (matchedHeader) {
            initialMapping[field.key] = matchedHeader;
          } else {
            initialMapping[field.key] = '';
          }
        });

        setColumnMapping(initialMapping);
        setStep('mapping');
        toast.success(`CSV loaded with ${results.data.length} rows & ${headers.length} columns.`);
      },
    });
  };

  // Run row-by-row validation using the current column mapping
  const runValidation = () => {
    const parsed: ParsedRow[] = rawRows.map((rawRow, index) => {
      const mapped: Record<string, any> = {};
      const errors: string[] = [];

      // Extract values based on mapping
      FIELD_DEFINITIONS.forEach((field) => {
        const mappedHeader = columnMapping[field.key];
        const rawVal = mappedHeader ? rawRow[mappedHeader] : undefined;
        mapped[field.key] = rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : null;
      });

      // 1. Required fields check
      if (!mapped.full_name) {
        errors.push('Full Name is required');
      }
      if (!mapped.contact_number) {
        errors.push('Contact Number is required');
      }
      if (!mapped.email) {
        errors.push('Email Address is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mapped.email)) {
        errors.push('Invalid email format');
      }

      // 2. Age check
      if (mapped.age) {
        const numAge = Number(mapped.age);
        if (isNaN(numAge) || numAge < 15 || numAge > 85) {
          errors.push(`Invalid age "${mapped.age}" (must be number between 15 and 85)`);
        }
      }

      // 3. Nature of Employment Enum check
      if (mapped.nature_of_employment) {
        const matchEnum = NATURE_OF_EMPLOYMENT.find(
          (opt) => opt.toLowerCase() === mapped.nature_of_employment.toLowerCase()
        );
        if (matchEnum) {
          mapped.nature_of_employment = matchEnum; // normalize casing
        } else {
          errors.push(
            `Invalid nature of employment "${mapped.nature_of_employment}". Must be Full-Time, Part-Time, or Internship.`
          );
        }
      } else {
        mapped.nature_of_employment = 'Full-Time'; // default fallback
      }

      return {
        rowIndex: index + 1,
        raw: rawRow,
        mapped,
        isValid: errors.length === 0,
        errors,
      };
    });

    setValidatedRows(parsed);
    setStep('preview');
  };

  // Perform bulk batch insert into Supabase
  const handleCommitImport = async () => {
    const validRowsToInsert = validatedRows.filter((r) => r.isValid);
    if (validRowsToInsert.length === 0) {
      toast.error('No valid rows available to import.');
      return;
    }

    setIsImporting(true);

    try {
      const recordsToInsert: PlacementRecordInsert[] = validRowsToInsert.map((r) => ({
        full_name: r.mapped.full_name,
        contact_number: r.mapped.contact_number,
        email: r.mapped.email,
        age: r.mapped.age ? Number(r.mapped.age) : null,
        current_location: r.mapped.current_location || null,
        qualification: r.mapped.qualification || null,
        zone: r.mapped.zone || null,
        centre: r.mapped.centre || null,
        course_name: r.mapped.course_name || null,
        batch_completion_month: r.mapped.batch_completion_month || null,
        batch_completion_year: r.mapped.batch_completion_year || null,
        technical_skills: r.mapped.technical_skills || null,
        work_experience: r.mapped.work_experience || null,
        nature_of_employment: (r.mapped.nature_of_employment as NatureOfEmployment) || 'Full-Time',
        preferred_job_role: r.mapped.preferred_job_role || null,
        preferred_location: r.mapped.preferred_location || null,
        expected_salary_stipend: r.mapped.expected_salary_stipend || null,
        additional_notes: r.mapped.additional_notes || null,
        source: 'csv_upload',
        created_by: user?.id || 'admin-system',
      }));

      const response = await bulkInsertPlacementRecords(recordsToInsert);

      if (response.success && response.result) {
        setImportSummary(response.result);
        setStep('summary');
        toast.success(`Successfully imported ${response.result.insertedCount} records!`);
        if (onImportComplete) onImportComplete();
      } else {
        toast.error(response.error || 'Failed to complete bulk import.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during import.');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = validatedRows.filter((r) => r.isValid).length;
  const invalidCount = validatedRows.filter((r) => !r.isValid).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6 shadow-sm">
      {/* Wizard Steps Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6 overflow-x-auto">
        {[
          { key: 'upload', label: '1. Select CSV File' },
          { key: 'mapping', label: '2. Map Headers' },
          { key: 'preview', label: '3. Validate & Preview' },
          { key: 'summary', label: '4. Summary & Report' },
        ].map((s, idx) => {
          const isCurrent = step === s.key;
          const isPast =
            (step === 'mapping' && idx === 0) ||
            (step === 'preview' && idx <= 1) ||
            (step === 'summary' && idx <= 2);

          return (
            <div key={s.key} className="flex items-center gap-3 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : isPast
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isPast ? <Check size={14} /> : idx + 1}
              </div>
              <span
                className={`text-xs font-semibold ${
                  isCurrent ? 'text-blue-600' : isPast ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
              {idx < 3 && <ChevronRight size={16} className="text-gray-300 mx-2" />}
            </div>
          );
        })}
      </div>

      {/* STEP 1: Upload File */}
      {step === 'upload' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl p-10 text-center bg-gray-50/50 hover:bg-blue-50/30 transition-all cursor-pointer"
        >
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Upload Placement Records CSV</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Drag & drop your candidate list .csv file here, or click to browse. Standard headers like Full Name, Email, Contact Number will be automatically mapped.
          </p>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm transition-all">
            <FileSpreadsheet size={16} /> Choose CSV File
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      )}

      {/* STEP 2: Column Mapping UI */}
      {step === 'mapping' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sliders size={20} className="text-blue-600" /> Map CSV Columns to Database Schema
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Found {csvHeaders.length} columns in <span className="font-semibold text-gray-800">{file?.name}</span>. Align mismatched headers to target database fields.
              </p>
            </div>
            <button
              onClick={() => setStep('upload')}
              className="text-xs text-gray-500 hover:text-gray-800 border px-3 py-1.5 rounded-lg"
            >
              Re-upload File
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 border rounded-xl p-4 bg-gray-50/50">
            {FIELD_DEFINITIONS.map((field) => (
              <div
                key={field.key}
                className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3"
              >
                <div>
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 font-bold">*</span>}
                  </label>
                  <p className="text-[10px] text-gray-400">Target Field: {field.key}</p>
                </div>

                <select
                  value={columnMapping[field.key] || ''}
                  onChange={(e) => setColumnMapping({ ...columnMapping, [field.key]: e.target.value })}
                  className="w-48 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                >
                  <option value="">-- Do Not Import --</option>
                  {csvHeaders.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={runValidation}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
            >
              Run Validation & Preview <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Validation & Preview */}
      {step === 'preview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Table size={20} className="text-blue-600" /> Data Validation & Row Preview
              </h3>
              <p className="text-xs text-gray-500 mt-1">Review rows before committing batch insert to Supabase.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1.5 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Valid: {validCount}
              </span>
              {invalidCount > 0 && (
                <span className="text-xs px-3 py-1.5 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200 flex items-center gap-1.5">
                  <XCircle size={14} /> Invalid: {invalidCount}
                </span>
              )}
            </div>
          </div>

          {/* Table Preview */}
          <div className="border border-gray-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold sticky top-0">
                <tr>
                  <th className="px-3 py-2.5">Row</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Full Name</th>
                  <th className="px-3 py-2.5">Email</th>
                  <th className="px-3 py-2.5">Contact</th>
                  <th className="px-3 py-2.5">Employment Nature</th>
                  <th className="px-3 py-2.5">Validation Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {validatedRows.map((r) => (
                  <tr key={r.rowIndex} className={r.isValid ? 'hover:bg-gray-50' : 'bg-red-50/40 hover:bg-red-50/70'}>
                    <td className="px-3 py-2 font-mono text-gray-500">{r.rowIndex}</td>
                    <td className="px-3 py-2">
                      {r.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                          <CheckCircle2 size={10} /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                          <XCircle size={10} /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-900">{r.mapped.full_name || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{r.mapped.email || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{r.mapped.contact_number || '-'}</td>
                    <td className="px-3 py-2 font-semibold text-blue-700">{r.mapped.nature_of_employment || '-'}</td>
                    <td className="px-3 py-2 text-xs">
                      {r.isValid ? (
                        <span className="text-gray-400">Ready to insert</span>
                      ) : (
                        <ul className="list-disc list-inside text-red-600 font-medium">
                          {r.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={() => setStep('mapping')}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
            >
              Back to Mapping
            </button>
            <button
              onClick={handleCommitImport}
              disabled={isImporting || validCount === 0}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Batch Inserting into Supabase...
                </>
              ) : (
                <>
                  <Database size={16} /> Import {validCount} Valid Records
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Import Summary & Report */}
      {step === 'summary' && importSummary && (
        <div className="space-y-6 animate-fade-in text-center py-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">CSV Import Completed</h3>
          <p className="text-xs text-gray-500">Summary report of rows processed for Supabase table placement_records.</p>

          <div className="grid grid-cols-2 max-w-md mx-auto gap-4 my-6">
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl">
              <p className="text-2xl font-bold text-green-700">{importSummary.insertedCount}</p>
              <p className="text-xs font-semibold text-green-600">Rows Inserted</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <p className="text-2xl font-bold text-amber-700">{importSummary.failedCount}</p>
              <p className="text-xs font-semibold text-amber-600">Rows Skipped / Failed</p>
            </div>
          </div>

          {importSummary.errors.length > 0 && (
            <div className="text-left border border-amber-200 rounded-xl p-4 bg-amber-50/50 max-h-48 overflow-y-auto">
              <p className="text-xs font-bold text-amber-900 mb-2">Skipped / Failed Row Details:</p>
              <ul className="space-y-1 text-xs text-amber-800">
                {importSummary.errors.map((err, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      Row #{err.rowIndex} ({err.recordName}): {err.reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 border-t flex justify-center gap-4">
            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setValidatedRows([]);
                setImportSummary(null);
              }}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw size={14} /> Upload Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
