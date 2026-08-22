'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ZONES, CENTRES, COURSES, NATURE_OF_EMPLOYMENT, MONTHS, BATCH_YEARS } from '@/lib/constants';
import { createPlacementRecord } from '@/app/actions/records';
import { PlacementRecordInsert, NatureOfEmployment } from '@/lib/supabase/types';
import { toast } from 'sonner';
import { isValidPhone } from '@/lib/utils';
import { User, Phone, Mail, MapPin, GraduationCap, Building, Calendar, Award, Briefcase, DollarSign, FileText, Send, Loader2, Sparkles } from 'lucide-react';

interface ManualEntryFormProps {
  onSuccess?: () => void;
}

export function ManualEntryForm({ onSuccess }: ManualEntryFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<PlacementRecordInsert>>({
    full_name: '',
    contact_number: '',
    email: '',
    age: null,
    current_location: '',
    qualification: '',
    zone: 'North Zone',
    centre: 'Delhi (Munirka)',
    course_name: COURSES[0],
    batch_completion_month: MONTHS[0],
    batch_completion_year: new Date().getFullYear().toString(),
    technical_skills: '',
    work_experience: '',
    nature_of_employment: 'Full-Time',
    preferred_job_role: '',
    preferred_location: '',
    expected_salary_stipend: '',
    additional_notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const NAME_PATTERN = /^[A-Za-z\s'-]*$/;
  const EMAIL_CHAR_PATTERN = /^[A-Za-z0-9@._%+-]*$/;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (NAME_PATTERN.test(value)) {
      setFormData({ ...formData, full_name: value });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (EMAIL_CHAR_PATTERN.test(value)) {
      setFormData({ ...formData, email: value });
    }
  };

  const PHONE_CHAR_PATTERN = /^[\d\s+-]*$/;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (PHONE_CHAR_PATTERN.test(value)) {
      setFormData({ ...formData, contact_number: value });
    }
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newZone = e.target.value;
    const availableCentres = CENTRES[newZone] || [];
    setFormData((prev) => ({
      ...prev,
      zone: newZone,
      centre: availableCentres[0] || '',
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.full_name?.trim()) {
      errs.full_name = 'Full name is required';
    } else if (!NAME_PATTERN.test(formData.full_name.trim())) {
      errs.full_name = 'Full name can only contain letters, spaces, hyphens and apostrophes';
    }

    if (!formData.contact_number?.trim()) {
      errs.contact_number = 'Contact number is required';
    } else if (!isValidPhone(formData.contact_number)) {
      errs.contact_number = 'Enter a valid 10-digit contact number';
    }

    if (!formData.email?.trim()) {
      errs.email = 'Email address is required';
    } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (formData.age !== null && formData.age !== undefined && String(formData.age) !== '') {
      const numAge = Number(formData.age);
      if (isNaN(numAge) || numAge < 16 || numAge > 80) {
        errs.age = 'Age must be a valid number between 16 and 80';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const recordPayload: PlacementRecordInsert = {
        full_name: formData.full_name!.trim(),
        contact_number: formData.contact_number!.trim(),
        email: formData.email!.trim(),
        age: formData.age ? Number(formData.age) : null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        address: formData.address?.trim() || null,
        institution: formData.institution?.trim() || null,
        year_of_passing: formData.year_of_passing || null,
        percentage_grade: formData.percentage_grade?.trim() || null,
        job_category: formData.job_category || null,
        travel_preference: formData.travel_preference || null,
        current_location: formData.current_location?.trim() || null,
        qualification: formData.qualification?.trim() || null,
        zone: formData.zone || null,
        centre: formData.centre || null,
        course_name: formData.course_name || null,
        batch_completion_month: formData.batch_completion_month || null,
        batch_completion_year: formData.batch_completion_year ? String(formData.batch_completion_year) : null,
        technical_skills: formData.technical_skills?.trim() || null,
        work_experience: formData.work_experience?.trim() || null,
        nature_of_employment: (formData.nature_of_employment as NatureOfEmployment) || 'Full-Time',
        preferred_job_role: formData.preferred_job_role?.trim() || null,
        preferred_location: formData.preferred_location?.trim() || null,
        expected_salary_stipend: formData.expected_salary_stipend?.trim() || null,
        additional_notes: formData.additional_notes?.trim() || null,
        source: 'manual',
        created_by: user?.id || 'admin-system',
      };

      const response = await createPlacementRecord(recordPayload);

      if (response.success) {
        toast.success(`Candidate record for "${recordPayload.full_name}" created successfully!`);
        // Reset form
        setFormData({
          full_name: '',
          contact_number: '',
          email: '',
          age: null,
          current_location: '',
          qualification: '',
          zone: 'North Zone',
          centre: CENTRES['North Zone'][0],
          course_name: COURSES[0],
          batch_completion_month: MONTHS[0],
          batch_completion_year: new Date().getFullYear().toString(),
          technical_skills: '',
          work_experience: '',
          nature_of_employment: 'Full-Time',
          preferred_job_role: '',
          preferred_location: '',
          expected_salary_stipend: '',
          additional_notes: '',
        });
        setErrors({});
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.error || 'Failed to create record');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const availableCentres = CENTRES[formData.zone || 'North Zone'] || [];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={20} className="text-blue-600" /> Manual Candidate Entry
          </h2>
          <p className="text-xs text-gray-500 mt-1">Enter complete candidate placement record details.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
          Source: Manual
        </span>
      </div>

      {/* Section 1: Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider text-xs border-l-4 border-blue-600 pl-3">
          1. Basic Candidate Info (Required)
        </h3>
        <div className="grid md:grid-cols-3 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.full_name || ''}
                onChange={handleNameChange}
                placeholder="e.g. Rahul Sharma"
                className={`w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                  errors.full_name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={formData.contact_number || ''}
                onChange={handlePhoneChange}
                placeholder="e.g. +91 9876543210"
                className={`w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                  errors.contact_number ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.contact_number && <p className="text-xs text-red-500 mt-1">{errors.contact_number}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email || ''}
                onChange={handleEmailChange}
                placeholder="rahul.sharma@example.com"
                className={`w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              value={formData.age !== null && formData.age !== undefined ? formData.age : ''}
              onChange={(e) => setFormData({ ...formData, age: e.target.value ? Number(e.target.value) : null })}
              placeholder="e.g. 22"
              min="16"
              max="80"
              className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                errors.age ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
          </div>

          {/* Current Location */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Current Location</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.current_location || ''}
                onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                placeholder="e.g. New Delhi"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Qualification */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Highest Qualification</label>
            <div className="relative">
              <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.qualification || ''}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. B.Tech Computer Science / B.Sc"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Organization & Course Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider text-xs border-l-4 border-orange-500 pl-3">
          2. Zone, Centre & Course Details
        </h3>
        <div className="grid md:grid-cols-4 gap-5">
          {/* Zone */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Zone</label>
            <select
              value={formData.zone || ''}
              onChange={handleZoneChange}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          {/* Centre */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Centre</label>
            <select
              value={formData.centre || ''}
              onChange={(e) => setFormData({ ...formData, centre: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            >
              {availableCentres.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Course Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Course Name</label>
            <select
              value={formData.course_name || ''}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Completion Month */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Batch Completion Month</label>
            <select
              value={formData.batch_completion_month || ''}
              onChange={(e) => setFormData({ ...formData, batch_completion_month: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Completion Year */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Batch Completion Year</label>
            <select
              value={formData.batch_completion_year || ''}
              onChange={(e) => setFormData({ ...formData, batch_completion_year: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            >
              {BATCH_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Type */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Employment Type</label>
            <select
              value={formData.nature_of_employment || 'Full-Time'}
              onChange={(e) => setFormData({ ...formData, nature_of_employment: e.target.value as NatureOfEmployment })}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-blue-700"
            >
              {NATURE_OF_EMPLOYMENT.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Career & Preference Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider text-xs border-l-4 border-green-500 pl-3">
          3. Preferences & Work History
        </h3>
        <div className="grid md:grid-cols-3 gap-5">
          {/* Preferred Job Role */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Job Role</label>
            <input
              type="text"
              value={formData.preferred_job_role || ''}
              onChange={(e) => setFormData({ ...formData, preferred_job_role: e.target.value })}
              placeholder="e.g. Frontend Developer / Data Analyst"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Preferred Location */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Location</label>
            <input
              type="text"
              value={formData.preferred_location || ''}
              onChange={(e) => setFormData({ ...formData, preferred_location: e.target.value })}
              placeholder="e.g. Gurugram / Remote / Bengaluru"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Expected Package / Salary / Stipend */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {formData.nature_of_employment === 'Full-Time' ? 'Expected Package (LPA)' : 'Expected Monthly Salary / Stipend'}
            </label>
            <input
              type="text"
              value={formData.expected_salary_stipend || ''}
              onChange={(e) => setFormData({ ...formData, expected_salary_stipend: e.target.value })}
              placeholder={formData.nature_of_employment === 'Full-Time' ? 'e.g. 4.5 LPA' : 'e.g. ₹20,000 / month'}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Textareas */}
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Technical Skills</label>
            <textarea
              rows={3}
              value={formData.technical_skills || ''}
              onChange={(e) => setFormData({ ...formData, technical_skills: e.target.value })}
              placeholder="e.g. React.js, Node.js, SQL, Python, Git..."
              className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Work Experience</label>
            <textarea
              rows={3}
              value={formData.work_experience || ''}
              onChange={(e) => setFormData({ ...formData, work_experience: e.target.value })}
              placeholder="e.g. 6 months internship at TechCorp, created web applications..."
              className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              rows={2}
              value={formData.additional_notes || ''}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              placeholder="Any special accommodations, interview availability, or extra remarks..."
              className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Saving Record...
            </>
          ) : (
            <>
              <Send size={16} /> Submit Placement Record
            </>
          )}
        </button>
      </div>
    </form>
  );
}
