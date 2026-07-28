'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2, Plus, X, Upload, FileCheck, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ZONES, JOB_CATEGORIES } from '@/lib/constants';
import { createStudentFromPortal, fetchStudentProfileByEmail } from '@/app/actions/students';
import { CentreInput } from '@/components/shared/CentreInput';

function createEmptyForm() {
  return {
    full_name: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    zone: 'North Zone',
    centre: '',
    city: '',
    address: '',
    qualification: '',
    institution: '',
    year_of_passing: '',
    percentage_grade: '',
    preferred_job_role: '',
    salary_expectation: '',
    preferred_city: '',
    travel_preference: 'Within City',
    job_category: '',
  };
}

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState(createEmptyForm());
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [photo, setPhoto] = useState<File | null>(null);
  const [idProof, setIdProof] = useState<File | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const idProofInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/portal/login');
      return;
    }

    fetchStudentProfileByEmail(user.email || '').then((res) => {
      if (res.data) {
        router.replace('/portal/jobs');
        return;
      }

      const meta = user.user_metadata || {};
      setForm((prev) => ({
        ...prev,
        full_name: meta.full_name || meta.name || '',
        phone: meta.phone || '',
      }));
      setChecking(false);
    });
  }, [authLoading, user, router]);

  const update = (key: keyof ReturnType<typeof createEmptyForm>, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.full_name.trim()) {
      toast.error('Full name is required.');
      return;
    }
    if (!form.phone.trim()) {
      toast.error('Phone number is required.');
      return;
    }

    setIsSaving(true);

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, value));
    fd.append('email', user.email || '');
    fd.append('status', 'Seeking');
    fd.append('skills', JSON.stringify(skills));
    fd.append('existing_photo_url', '');
    fd.append('existing_resume_url', '');
    fd.append('existing_id_proof_url', '');
    fd.append('existing_certificate_urls', JSON.stringify([]));
    if (photo) fd.append('photo', photo);
    if (idProof) fd.append('id_proof', idProof);

    const res = await createStudentFromPortal(fd);

    if (res.success) {
      toast.success('Profile completed!');
      router.push('/portal/jobs');
    } else {
      toast.error(res.error || 'Could not save your profile.');
      setIsSaving(false);
    }
  };

  const inputClass = 'w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  const documentSlots: Array<{
    key: 'photo' | 'id_proof';
    label: string;
    file: File | null;
    ref: typeof photoInputRef;
    onSelect: (files: FileList | null) => void;
  }> = [
    { key: 'photo', label: 'Photo', file: photo, ref: photoInputRef, onSelect: (files) => setPhoto(files?.[0] || null) },
    { key: 'id_proof', label: 'ID Proof', file: idProof, ref: idProofInputRef, onSelect: (files) => setIdProof(files?.[0] || null) },
  ];

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-amber-50/50 to-white">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="text-sm font-medium text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-orange-50/20 to-white font-sans">
      <header className="sticky top-0 z-40 bg-amber-50/70 backdrop-blur-md border-b border-amber-100/70">
        <div className="max-w-4xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/image.png" alt="Vidya" width={36} height={36} />
            <div>
              <p className="font-bold text-gray-900 leading-tight">Vidya VPMS</p>
              <p className="text-[10px] text-blue-600 font-semibold leading-tight">Complete Your Profile</p>
            </div>
          </div>
          <button
            onClick={async () => { await signOut(); router.push('/portal/login'); }}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, let's set up your profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Please fill this in once — it helps us match you to the right job openings. You won't be asked again.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Basic Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input required type="text" placeholder="Priya Sharma" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={user?.email || ''} disabled className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed`} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input required type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className={inputClass}>
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Zone</label>
                <select value={form.zone} onChange={(e) => { update('zone', e.target.value); update('centre', ''); }} className={inputClass}>
                  {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Centre</label>
                <CentreInput value={form.centre} onChange={(v) => update('centre', v)} zone={form.zone} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input type="text" placeholder="Mumbai" value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address</label>
                <input type="text" placeholder="B-204, Andheri West, Mumbai" value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Education</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Highest Qualification</label>
                <select value={form.qualification} onChange={(e) => update('qualification', e.target.value)} className={inputClass}>
                  <option value="">Select qualification</option>
                  <option value="10th Pass">10th Pass</option>
                  <option value="12th Pass">12th Pass</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="ITI">ITI</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Institution</label>
                <input type="text" placeholder="School/College name" value={form.institution} onChange={(e) => update('institution', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Year of Passing</label>
                <input type="text" placeholder="2020" value={form.year_of_passing} onChange={(e) => update('year_of_passing', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Percentage / Grade</label>
                <input type="text" placeholder="75%" value={form.percentage_grade} onChange={(e) => update('percentage_grade', e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a skill and press Add"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className={inputClass}
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                    <X size={14} />
                  </button>
                </span>
              ))}
              {skills.length === 0 && <p className="text-sm text-gray-400">No skills added yet.</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Job Preferences</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Preferred Job Role</label>
                <input type="text" placeholder="Sales Executive" value={form.preferred_job_role} onChange={(e) => update('preferred_job_role', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Salary Expectation</label>
                <input type="text" placeholder="₹18,000" value={form.salary_expectation} onChange={(e) => update('salary_expectation', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Preferred City</label>
                <input type="text" placeholder="Mumbai" value={form.preferred_city} onChange={(e) => update('preferred_city', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Travel Preference</label>
                <select value={form.travel_preference} onChange={(e) => update('travel_preference', e.target.value)} className={inputClass}>
                  <option value="Within City">Within City</option>
                  <option value="Any Location">Any Location</option>
                  <option value="Home State Only">Home State Only</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Job Category</label>
                <select value={form.job_category} onChange={(e) => update('job_category', e.target.value)} className={inputClass}>
                  <option value="">Select category</option>
                  {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            <p className="text-sm text-gray-500">Optional — you can also add these later from Resume Builder.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {documentSlots.map((slot) => {
                const hasFile = !!slot.file;
                const fileNames = slot.file?.name;

                return (
                  <div
                    key={slot.key}
                    onClick={() => slot.ref.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
                      hasFile ? 'border-green-300 bg-green-50/40' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      ref={slot.ref}
                      type="file"
                      accept={slot.key === 'photo' ? 'image/*' : '.pdf,.jpg,.jpeg,.png'}
                      className="hidden"
                      onChange={(e) => slot.onSelect(e.target.files)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {hasFile ? (
                      <FileCheck size={24} className="mx-auto text-green-600 mb-2" />
                    ) : (
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    )}
                    <p className="text-sm font-medium text-gray-700">{slot.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{hasFile ? fileNames : 'Click to upload · PDF, JPG, PNG'}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isSaving ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
