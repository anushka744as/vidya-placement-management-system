"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  User,
  GraduationCap,
  Briefcase,
  Award,
  Download,
  Eye,
  Plus,
  Mail,
  Phone,
  MapPin,
  FileText,
  Sparkles,
} from "lucide-react";

export default function ResumePage() {
  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
            <p className="text-sm text-gray-500 mt-0.5">Build and download your professional resume</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Eye size={16} /> Preview
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              <Sparkles size={16} /> Generate
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left - Editable sections */}
          <div className="space-y-4">
            {[
              { icon: User, title: "Personal Information", fields: ["Full Name", "Email", "Phone", "Address"] },
              { icon: GraduationCap, title: "Education", fields: ["Qualification", "Institution", "Year", "Grade"] },
              { icon: Award, title: "Skills", fields: ["Add skills"] },
              { icon: Briefcase, title: "Experience", fields: ["Company", "Role", "Duration"] },
              { icon: FileText, title: "Projects", fields: ["Project Name", "Description"] },
            ].map((section, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <section.icon size={18} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {section.fields.map((field, j) => (
                    <div key={j}>
                      <label className="text-xs text-gray-400">{field}</label>
                      <input
                        type="text"
                        placeholder={field}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right - Resume Preview */}
          <div className="lg:sticky lg:top-6 self-start">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              {/* Header */}
              <div className="pb-6 border-b-2 border-blue-600">
                <h2 className="text-2xl font-bold text-gray-900">Priya Sharma</h2>
                <p className="text-blue-600 font-medium mt-1">Sales Executive</p>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Mail size={12} /> priya@email.com</span>
                  <span className="flex items-center gap-1"><Phone size={12} /> +91 98765 43210</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> Mumbai, India</span>
                </div>
              </div>

              {/* Education */}
              <div className="py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Education</h3>
                <div>
                  <p className="text-sm font-medium text-gray-800">12th Pass</p>
                  <p className="text-xs text-gray-500">Maharashtra Board · 2019</p>
                </div>
              </div>

              {/* Skills */}
              <div className="py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {["Communication", "Customer Service", "MS Office"].map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Experience</h3>
                <div>
                  <p className="text-sm font-medium text-gray-800">Sales Executive · Reliance Retail</p>
                  <p className="text-xs text-gray-500">Jan 2024 – Present</p>
                  <p className="text-xs text-gray-600 mt-1">Managing customer relationships and achieving sales targets in retail environment.</p>
                </div>
              </div>

              {/* Certificates */}
              <div className="py-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Certificates</h3>
                <ul className="space-y-1">
                  <li className="text-sm text-gray-700 flex items-center gap-2">
                    <Award size={14} className="text-green-600" /> Retail Sales – Level 2
                  </li>
                  <li className="text-sm text-gray-700 flex items-center gap-2">
                    <Award size={14} className="text-green-600" /> Customer Handling
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
