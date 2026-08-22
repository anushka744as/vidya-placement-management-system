'use client';

import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { StudentLayout } from '@/components/portal/StudentLayout';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchResumeProfile, upsertResumeProfile } from '@/app/actions/portal';
import { ResumeProfile, EducationEntry, ExperienceEntry } from '@/lib/supabase/portal-types';
import { toast } from 'sonner';
import {
  FileEdit,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  Plus,
  Trash2,
  Download,
  FileCheck,
  Loader2,
  Save,
  Eye,
} from 'lucide-react';

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const studentUserId = user?.id || '';
  const resumeRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingWord, setGeneratingWord] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const PHONE_PATTERN = /^\d{10}$/;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [education, setEducation] = useState<EducationEntry[]>([
    { degree: 'Diploma in Retail Sales Management', institution: 'Vidya NGO Training Centre', year: '2024' },
    { degree: 'Higher Secondary (12th Pass)', institution: 'Govt. Model Senior Secondary School', year: '2022' },
  ]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [skills, setSkills] = useState<string[]>(['Customer Service', 'Retail Sales', 'Communication', 'MS Office']);
  const [skillInput, setSkillInput] = useState('');
  const [certifications, setCertifications] = useState('Certified Retail Sales Associate - Level 2 (NSDC)');
  const [resumePdfUrl, setResumePdfUrl] = useState<string | null>(null);

  // Load existing profile from localStorage or Supabase
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      // Check localStorage draft first
      const localDraft = localStorage.getItem(`vpms_resume_${studentUserId}`);
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft);
          setFullName(parsed.full_name || '');
          setEmail(parsed.email || '');
          setPhone(parsed.phone || '');
          setLocation(parsed.location || '');
          setSummary(parsed.summary || '');
          if (parsed.education) setEducation(parsed.education);
          if (parsed.experience) setExperience(parsed.experience);
          if (parsed.skills) setSkills(parsed.skills);
          if (parsed.certifications) setCertifications(parsed.certifications);
          if (parsed.resume_pdf_url) setResumePdfUrl(parsed.resume_pdf_url);
        } catch {
          // Fall through
        }
      }

      // Fetch from Supabase database, if signed in
      try {
        const res = user?.id ? await fetchResumeProfile(user.id) : { data: undefined };
        if (res.data) {
          const p = res.data;
          setFullName(p.full_name || '');
          setEmail(p.email || '');
          setPhone(p.phone || '');
          setLocation(p.location || '');
          setSummary(p.summary || '');
          if (p.education) setEducation(p.education);
          if (p.experience) setExperience(p.experience);
          if (p.skills) setSkills(p.skills);
          if (p.certifications) setCertifications(p.certifications);
          if (p.resume_pdf_url) setResumePdfUrl(p.resume_pdf_url);
        } else if (!localDraft) {
          // Pre-fill email/name defaults if user is logged in
          if (user?.email) setEmail(user.email);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [studentUserId, user?.email]);

  // Auto-save form progress to localStorage on change
  useEffect(() => {
    if (loading) return;
    const draft = {
      full_name: fullName,
      email,
      phone,
      location,
      summary,
      education,
      experience,
      skills,
      certifications,
      resume_pdf_url: resumePdfUrl,
    };
    localStorage.setItem(`vpms_resume_${studentUserId}`, JSON.stringify(draft));
  }, [fullName, email, phone, location, summary, education, experience, skills, certifications, resumePdfUrl, studentUserId, loading]);

  // Save profile to Supabase
  const handleSaveProfile = async () => {
    if (!validate()) return;
    if (!user?.id) {
      toast.success('Saved locally. Sign in to sync your resume and keep it linked to your applications.');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<ResumeProfile> = {
        full_name: fullName,
        email,
        phone,
        location,
        summary,
        education,
        experience,
        skills,
        certifications,
        resume_pdf_url: resumePdfUrl,
      };

      const res = await upsertResumeProfile(user.id, payload);
      if (res.success) {
        toast.success('Resume profile saved to database!');
      } else {
        toast.error(res.error || 'Failed to save resume.');
      }
    } catch {
      toast.error('Failed to save resume profile.');
    } finally {
      setSaving(false);
    }
  };

  // Repeatable Education Helpers
  const addEducation = () => {
    setEducation([...education, { degree: '', institution: '', year: '' }]);
  };
  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };
  const updateEducation = (index: number, field: keyof EducationEntry, val: string) => {
    const updated = [...education];
    updated[index][field] = val;
    setEducation(updated);
  };

  // Repeatable Experience Helpers
  const addExperience = () => {
    setExperience([...experience, { role: '', company: '', duration: '', description: '' }]);
  };
  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };
  const updateExperience = (index: number, field: keyof ExperienceEntry, val: string) => {
    const updated = [...experience];
    updated[index][field] = val;
    setExperience(updated);
  };

  // Skills Helpers
  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Validate mandatory fields before saving/exporting
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = 'Full Name is required';
    if (!email.trim()) {
      errs.email = 'Email Address is required';
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!phone.trim()) {
      errs.phone = 'Phone Number is required';
    } else if (!PHONE_PATTERN.test(phone.trim())) {
      errs.phone = 'Phone Number must be exactly 10 digits';
    }
    if (!education.some((edu) => edu.degree.trim() && edu.institution.trim())) {
      errs.education = 'At least one Education entry (Degree & Institution) is required';
    }
    if (skills.length === 0) {
      errs.skills = 'At least one skill is required';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the highlighted fields before continuing.');
      return false;
    }
    return true;
  };

  // Generate & Download PDF
  const handleGeneratePDF = async () => {
    if (!validate()) return;
    if (!resumeRef.current) return;
    setGeneratingPdf(true);

    try {
      const element = resumeRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `${fullName.replace(/\s+/g, '_') || 'Student'}_Resume.pdf`;
      pdf.save(fileName);

      // Save Data URL to state, and to Supabase if signed in
      const pdfDataUrl = imgData;
      setResumePdfUrl(pdfDataUrl);
      if (user?.id) {
        await upsertResumeProfile(user.id, {
          full_name: fullName,
          email,
          phone,
          location,
          summary,
          education,
          experience,
          skills,
          certifications,
          resume_pdf_url: pdfDataUrl,
        });
      }

      toast.success('Resume PDF generated and downloaded successfully!');
    } catch (err: any) {
      toast.error('Failed to generate PDF resume.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Generate & Download Word (.docx)
  const handleGenerateWord = async () => {
    if (!validate()) return;
    setGeneratingWord(true);

    try {
      const children: Paragraph[] = [
        new Paragraph({ text: fullName || 'Your Full Name', heading: HeadingLevel.TITLE }),
        new Paragraph({ text: [email, phone, location].filter(Boolean).join('  •  ') }),
      ];

      if (summary) {
        children.push(
          new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
          new Paragraph({ text: summary })
        );
      }

      if (education.length > 0) {
        children.push(new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
        education.forEach((edu) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${edu.degree || 'Degree / Course'} — `, bold: true }),
                new TextRun({ text: `${edu.institution || 'Institution'} (${edu.year || ''})` }),
              ],
            })
          );
        });
      }

      if (experience.length > 0) {
        children.push(new Paragraph({ text: 'Work Experience', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
        experience.forEach((exp) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${exp.role || 'Role'} — `, bold: true }),
                new TextRun({ text: `${exp.company || ''} (${exp.duration || ''})` }),
              ],
            })
          );
          if (exp.description) children.push(new Paragraph({ text: exp.description }));
        });
      }

      if (skills.length > 0) {
        children.push(
          new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
          new Paragraph({ text: skills.join(', ') })
        );
      }

      if (certifications) {
        children.push(
          new Paragraph({ text: 'Certifications', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
          new Paragraph({ text: certifications })
        );
      }

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fullName.replace(/\s+/g, '_') || 'Student'}_Resume.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Resume Word document generated and downloaded successfully!');
    } catch (err: any) {
      toast.error('Failed to generate Word resume.');
    } finally {
      setGeneratingWord(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <p className="text-sm font-medium text-gray-500">Loading Resume Builder...</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileEdit className="text-blue-600" size={26} /> Digital Resume Builder
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Build your single-page resume. Progress auto-saves as you type.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Auto-Saved</>}
            </button>

            <button
              onClick={handleGeneratePDF}
              disabled={generatingPdf}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {generatingPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Compiling PDF...
                </>
              ) : (
                <>
                  <Download size={14} /> Download PDF
                </>
              )}
            </button>

            <button
              onClick={handleGenerateWord}
              disabled={generatingWord}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {generatingWord ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Compiling Word...
                </>
              ) : (
                <>
                  <Download size={14} /> Download Word
                </>
              )}
            </button>
          </div>
        </div>

        {/* Builder & Live Preview Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 space-y-6 shadow-sm">
            {/* Section 1: Personal Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-l-4 border-blue-600 pl-3">
                1. Personal Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className={`w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-blue-100 ${errors.fullName ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.fullName && <p className="mt-1 text-[10px] text-red-600">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya.sharma@example.com"
                    className={`w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-blue-100 ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.email && <p className="mt-1 text-[10px] text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className={`w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-blue-100 ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.phone && <p className="mt-1 text-[10px] text-red-600">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location / City <span className="text-[10px] text-gray-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Mumbai, Maharashtra"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Professional Summary</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Enthusiastic certified graduate seeking an entry-level position in Retail Sales / Customer Support..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Section 2: Education */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-l-4 border-orange-500 pl-3">
                  2. Education History <span className="text-red-500">*</span>
                </h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add Education
                </button>
              </div>
              {errors.education && <p className="text-[10px] text-red-600">{errors.education}</p>}

              {education.map((edu, idx) => (
                <div key={idx} className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 relative space-y-3">
                  {education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Degree / Course</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                        placeholder="e.g. Retail Sales Management"
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Institution / School</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                        placeholder="e.g. Vidya NGO Centre"
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Completion Year</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                        placeholder="2024"
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Section 3: Work Experience (Optional) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-l-4 border-purple-500 pl-3">
                    3. Work Experience
                  </h3>
                  <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                    Optional (Freshers OK)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add Experience
                </button>
              </div>

              {experience.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-xs text-gray-400">
                  No prior work experience added. (First-time job seekers can skip this section).
                </div>
              ) : (
                experience.map((exp, idx) => (
                  <div key={idx} className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 relative space-y-3">
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Role Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                          placeholder="e.g. Sales Intern"
                          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                          placeholder="e.g. Retail Store"
                          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                          placeholder="e.g. 6 Months (2023)"
                          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Section 4: Skills (Tag Input) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-l-4 border-green-500 pl-3">
                4. Key Skills <span className="text-red-500">*</span>
              </h3>
              {errors.skills && <p className="text-[10px] text-red-600">{errors.skills}</p>}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Type a skill (e.g. Customer Care, MS Excel) and press Enter"
                  className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl"
                >
                  Add
                </button>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full border border-blue-100"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-blue-900 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Section 5: Certifications */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-l-4 border-amber-500 pl-3">
                5. Certifications & Achievements
              </h3>
              <textarea
                rows={2}
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="e.g. Certified Retail Sales Associate (Level 2), Customer Handling Excellence Award..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Right Live Resume Preview (5 Cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={16} className="text-blue-600" /> Live Resume Preview
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Single-Page Layout</span>
            </div>

            {/* Printable Single-Page Document Canvas */}
            <div
              ref={resumeRef}
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md text-gray-900 space-y-5 font-sans"
              style={{ minHeight: '680px' }}
            >
              {/* Header */}
              <div className="border-b border-gray-200 pb-4 space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-blue-700">{fullName || 'Your Full Name'}</h2>
                <div className="text-[11px] text-gray-600 flex flex-wrap gap-3">
                  {email && <span>{email}</span>}
                  {phone && <span>• {phone}</span>}
                  {location && <span>• {location}</span>}
                </div>
              </div>

              {/* Summary */}
              {summary && (
                <div className="space-y-1">
                  <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-0.5">
                    Professional Summary
                  </h3>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{summary}</p>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-0.5">
                    Education
                  </h3>
                  <div className="space-y-1.5">
                    {education.map((edu, i) => (
                      <div key={i} className="flex justify-between items-start text-[11px]">
                        <div>
                          <p className="font-bold text-gray-800">{edu.degree || 'Degree / Course'}</p>
                          <p className="text-gray-500">{edu.institution || 'Institution'}</p>
                        </div>
                        <span className="text-gray-400 font-medium">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {experience.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-0.5">
                    Work Experience
                  </h3>
                  <div className="space-y-1.5">
                    {experience.map((exp, i) => (
                      <div key={i} className="flex justify-between items-start text-[11px]">
                        <div>
                          <p className="font-bold text-gray-800">{exp.role}</p>
                          <p className="text-gray-500">{exp.company}</p>
                        </div>
                        <span className="text-gray-400 font-medium">{exp.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-0.5">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((s, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {certifications && (
                <div className="space-y-1">
                  <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-0.5">
                    Certifications
                  </h3>
                  <p className="text-[11px] text-gray-600">{certifications}</p>
                </div>
              )}
            </div>

            {/* Action Bar Below Preview */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-3 shadow-sm">
              <span className="text-xs text-gray-500">Ready to download?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGeneratePDF}
                  disabled={generatingPdf}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <Download size={14} /> PDF
                </button>
                <button
                  onClick={handleGenerateWord}
                  disabled={generatingWord}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <Download size={14} /> Word
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
