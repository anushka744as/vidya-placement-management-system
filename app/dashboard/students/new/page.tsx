"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  User,
  GraduationCap,
  Briefcase,
  Settings,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Upload,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const steps = [
  { label: "Basic Details", icon: User },
  { label: "Education", icon: GraduationCap },
  { label: "Skills", icon: Briefcase },
  { label: "Job Preferences", icon: Settings },
  { label: "Documents", icon: FileText },
  { label: "Review", icon: CheckCircle2 },
];

export default function StudentFormPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [skills, setSkills] = useState<string[]>(["Communication", "MS Office"]);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const inputClass = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <Link href="/dashboard/students" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Students
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Add Student</h1>
        <p className="text-sm text-gray-500 mb-8">Fill in the details below to add a new student.</p>

        {/* Stepper */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      i < currentStep
                        ? "bg-green-500 text-white"
                        : i === currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i < currentStep ? <CheckCircle2 size={20} /> : <step.icon size={18} />}
                  </div>
                  <span className={`text-xs font-medium hidden md:block ${i === currentStep ? "text-blue-600" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all ${i < currentStep ? "bg-green-500" : "bg-gray-100"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          {currentStep === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Basic Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" placeholder="Priya Sharma" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" placeholder="priya@email.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" placeholder="+91 98765 43210" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select className={inputClass}>
                    <option>Select gender</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Center</label>
                  <select className={inputClass}>
                    <option>Select center</option>
                    <option>Mumbai Central</option>
                    <option>Delhi East</option>
                    <option>Bangalore South</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address</label>
                  <input type="text" placeholder="B-204, Andheri West, Mumbai" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Education</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Highest Qualification</label>
                  <select className={inputClass}>
                    <option>Select qualification</option>
                    <option>10th Pass</option>
                    <option>12th Pass</option>
                    <option>Graduate</option>
                    <option>ITI</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Institution</label>
                  <input type="text" placeholder="School/College name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Year of Passing</label>
                  <input type="text" placeholder="2020" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Percentage / Grade</label>
                  <input type="text" placeholder="75%" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
              <p className="text-sm text-gray-500">Add skills that the student has acquired.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a skill and press Add"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  className={inputClass}
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((skill, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && <p className="text-sm text-gray-400">No skills added yet.</p>}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Job Preferences</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Preferred Job Role</label>
                  <input type="text" placeholder="Sales Executive" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Salary Expectation</label>
                  <input type="text" placeholder="₹18,000" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Preferred City</label>
                  <select className={inputClass}>
                    <option>Select city</option>
                    <option>Mumbai</option>
                    <option>Delhi</option>
                    <option>Bangalore</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Travel Preference</label>
                  <select className={inputClass}>
                    <option>Within City</option>
                    <option>Any Location</option>
                    <option>Home State Only</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Job Category</label>
                  <select className={inputClass}>
                    <option>Select category</option>
                    <option>Retail</option>
                    <option>BPO</option>
                    <option>Healthcare</option>
                    <option>Electrical</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
              <p className="text-sm text-gray-500">Upload the student's documents.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {["Resume", "ID Proof", "Photo", "Certificates"].map((doc, i) => (
                  <div key={i} className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">{doc}</p>
                    <p className="text-xs text-gray-400 mt-1">Click to upload · PDF, JPG, PNG</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Review</h2>
              <p className="text-sm text-gray-500">Please review all details before submitting.</p>
              <div className="space-y-3">
                {steps.slice(0, 5).map((step, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                        <CheckCircle2 size={18} className="text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{step.label}</span>
                    </div>
                    <button
                      onClick={() => setCurrentStep(i)}
                      className="text-xs text-blue-600 font-medium hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} /> Previous
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 transition-all"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors">
                <CheckCircle2 size={16} /> Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
