"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { ZONES, CENTRES, COURSES } from "@/lib/constants";
import { fetchAllSuccessStories, createSuccessStory, updateSuccessStory, deleteSuccessStory } from "@/app/actions/success-stories";
import { SuccessStory } from "@/lib/supabase/success-story-types";
import {
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
  Upload,
  FileCheck,
  Star,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

function createEmptyForm() {
  return {
    student_name: "",
    course_name: "",
    centre: "",
    zone: "North Zone",
    company_placed: "",
    job_role: "",
    package_stipend: "",
    testimonial: "",
    batch_year: new Date().getFullYear().toString(),
    is_featured: true,
    display_order: "0",
  };
}

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(createEmptyForm());
  const [photo, setPhoto] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const loadStories = async () => {
    setIsLoading(true);
    const res = await fetchAllSuccessStories();
    setStories(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadStories();
  }, []);

  const resetForm = () => {
    setForm(createEmptyForm());
    setPhoto(null);
    setExistingPhotoUrl(null);
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (story: SuccessStory) => {
    setEditingId(story.id);
    setForm({
      student_name: story.student_name,
      course_name: story.course_name || "",
      centre: story.centre || "",
      zone: story.zone || "North Zone",
      company_placed: story.company_placed || "",
      job_role: story.job_role || "",
      package_stipend: story.package_stipend || "",
      testimonial: story.testimonial,
      batch_year: story.batch_year?.toString() || new Date().getFullYear().toString(),
      is_featured: story.is_featured,
      display_order: story.display_order?.toString() || "0",
    });
    setExistingPhotoUrl(story.photo_url);
    setPhoto(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)));
    fd.append("existing_photo_url", existingPhotoUrl || "");
    if (photo) fd.append("photo", photo);

    const res = editingId ? await updateSuccessStory(editingId, fd) : await createSuccessStory(fd);

    if (res.success) {
      toast.success(editingId ? "Success story updated." : "Success story published.");
      resetForm();
      await loadStories();
    } else {
      toast.error(res.error || "Could not save success story.");
    }

    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this success story? This cannot be undone.")) return;

    const res = await deleteSuccessStory(id);
    if (res.success) {
      setStories((prev) => prev.filter((s) => s.id !== id));
      toast.success("Success story removed.");
    } else {
      toast.error(res.error || "Could not delete success story.");
    }
  };

  const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Success Stories</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage the student success stories shown in the homepage carousel.</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm((prev) => !prev);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} /> {showForm ? "Close Form" : "Add Success Story"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{editingId ? "Edit Success Story" : "Add Success Story"}</h2>
              <button type="button" onClick={resetForm} className="rounded-full p-2 hover:bg-gray-100">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Student Name</label>
                <input required value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Course</label>
                <select value={form.course_name} onChange={(e) => setForm({ ...form, course_name: e.target.value })} className={inputClass}>
                  <option value="">Select course</option>
                  {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Zone</label>
                <select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value, centre: "" })} className={inputClass}>
                  {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Centre</label>
                <select value={form.centre} onChange={(e) => setForm({ ...form, centre: e.target.value })} className={inputClass}>
                  <option value="">Select centre</option>
                  {(CENTRES[form.zone] || []).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Company Placed At</label>
                <input value={form.company_placed} onChange={(e) => setForm({ ...form, company_placed: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Job Role</label>
                <input value={form.job_role} onChange={(e) => setForm({ ...form, job_role: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Package / Stipend</label>
                <input value={form.package_stipend} onChange={(e) => setForm({ ...form, package_stipend: e.target.value })} placeholder="₹20,000 / month" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Batch Year</label>
                <input type="number" value={form.batch_year} onChange={(e) => setForm({ ...form, batch_year: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Display Order</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className={inputClass} />
                <p className="mt-1 text-xs text-gray-400">Lower numbers show first in the carousel.</p>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="is_featured"
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Show in homepage carousel</label>
              </div>
            </div>

            <div>
              <label className={labelClass}>Testimonial</label>
              <textarea required rows={4} value={form.testimonial} onChange={(e) => setForm({ ...form, testimonial: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Photo</label>
              <div
                onClick={() => photoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors max-w-xs ${
                  photo || existingPhotoUrl ? "border-green-300 bg-green-50/40" : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
                {photo || existingPhotoUrl ? <FileCheck size={22} className="mx-auto text-green-600 mb-1.5" /> : <Upload size={22} className="mx-auto text-gray-400 mb-1.5" />}
                <p className="text-xs font-medium text-gray-700">{photo ? photo.name : existingPhotoUrl ? "Photo on file — click to replace" : "Click to upload photo"}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} {editingId ? "Save Changes" : "Publish Story"}
              </button>
            </div>
          </form>
        )}

        {isLoading && (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
            <Loader2 size={28} className="mx-auto animate-spin text-blue-600" />
            <p className="mt-3 font-medium text-gray-500">Loading success stories...</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {!isLoading && stories.map((story) => (
            <div key={story.id} className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {story.photo_url ? (
                    <img src={story.photo_url} alt={story.student_name} className="w-11 h-11 rounded-xl object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      {story.student_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{story.student_name}</h3>
                    <p className="text-xs text-gray-400">{story.course_name || "—"}</p>
                  </div>
                </div>
                {story.is_featured ? (
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700"><Star size={10} /> Featured</span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500">Hidden</span>
                )}
              </div>

              {story.job_role && story.company_placed && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-600"><Briefcase size={12} /> {story.job_role} at {story.company_placed}</p>
              )}

              <p className="mt-3 line-clamp-3 text-sm text-gray-600">"{story.testimonial}"</p>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs text-gray-400">Order: {story.display_order}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(story)} className="rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">Edit</button>
                  <button onClick={() => handleDelete(story.id)} className="rounded-lg border border-red-200 px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && stories.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
            <Star size={28} className="mx-auto text-gray-300" />
            <p className="mt-3 font-medium text-gray-500">No success stories yet</p>
            <p className="mt-1 text-sm text-gray-400">Add one to feature it in the homepage carousel.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
