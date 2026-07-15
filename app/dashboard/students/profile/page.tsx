"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/shared/StatCard";
import { mockStudents } from "@/lib/mock-data";
import {
  Mail,
  Phone,
  MapPin,
  Download,
  Edit,
  GraduationCap,
  Award,
  CheckCircle2,
  Upload,
  File,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function StudentProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "1";
  const student = mockStudents.find((s) => s.id === id) || mockStudents[0];

  const timeline = [
    { event: "Enrolled in course", date: "Jan 2024", icon: GraduationCap, color: "blue" },
    { event: "Course completed", date: "Mar 2024", icon: Award, color: "green" },
    { event: "Applied for job", date: "Mar 2024", icon: CheckCircle2, color: "orange" },
    { event: "Interview scheduled", date: "Mar 15, 2024", icon: CheckCircle2, color: "purple" },
    ...(student.status === "Placed" ? [{ event: `Placed at ${student.company}`, date: student.joinDate || "", icon: CheckCircle2, color: "green" }] : []),
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        <Link href="/dashboard/students" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Students
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <img src={student.photo} alt={student.name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900">{student.name}</h2>
            <p className="text-sm text-gray-400 mb-3">{student.jobPreference}</p>
            <div className="flex justify-center mb-5">
              <StatusBadge status={student.status} />
            </div>
            <div className="space-y-2.5 text-left text-sm">
              <div className="flex items-center gap-2 text-gray-600"><Mail size={14} className="text-gray-400" /> {student.email}</div>
              <div className="flex items-center gap-2 text-gray-600"><Phone size={14} className="text-gray-400" /> {student.phone}</div>
              <div className="flex items-center gap-2 text-gray-600"><MapPin size={14} className="text-gray-400" /> {student.city}</div>
            </div>
            <div className="flex gap-2 mt-5">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
                <Download size={16} /> Resume
              </button>
              <Link href={`/dashboard/students/new?id=${student.id}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                <Edit size={16} /> Edit
              </Link>
            </div>
          </div>

          {/* Right - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal + Basic Info Combined */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-5">Personal Details</h3>
              <div className="grid grid-cols-2 gap-5 text-sm">
                <div><p className="text-xs text-gray-400 mb-1">Gender</p><p className="text-gray-800 font-medium">{student.gender}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Date of Birth</p><p className="text-gray-800 font-medium">{student.dob}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Zone</p><p className="text-gray-800 font-medium">{student.zone}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Center</p><p className="text-gray-800 font-medium">{student.center}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-400 mb-1">Address</p><p className="text-gray-800 font-medium">{student.address}</p></div>
              </div>
            </div>

            {/* Education + Skills + Certificates Combined */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-5">Education & Skills</h3>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <GraduationCap size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{student.education}</p>
                  <p className="text-xs text-gray-400">Highest Qualification</p>
                </div>
              </div>
              <div className="mb-5">
                <p className="text-xs text-gray-400 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-lg">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Certificates</p>
                <div className="space-y-2">
                  {student.certificates.map((cert, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Award size={18} className="text-green-600 shrink-0" />
                      <span className="text-sm text-gray-700 flex-1">{cert}</span>
                      <Download size={16} className="text-blue-600 cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-5">Job Preferences</h3>
              <div className="grid grid-cols-3 gap-5 text-sm">
                <div><p className="text-xs text-gray-400 mb-1">Preference</p><p className="text-gray-800 font-medium">{student.jobPreference}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Salary Exp.</p><p className="text-gray-800 font-medium">{student.salaryExpectation}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Travel</p><p className="text-gray-800 font-medium">Within City</p></div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-5">Placement Timeline</h3>
              <div className="space-y-4">
                {timeline.map((t, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        t.color === "blue" ? "bg-blue-50 text-blue-600" :
                        t.color === "green" ? "bg-green-50 text-green-600" :
                        t.color === "orange" ? "bg-orange-50 text-orange-600" :
                        "bg-purple-50 text-purple-600"
                      }`}>
                        <t.icon size={16} />
                      </div>
                      {i < timeline.length - 1 && <div className="w-0.5 h-6 bg-gray-100 mt-1" />}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-medium text-gray-800">{t.event}</p>
                      <p className="text-xs text-gray-400">{t.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-5">Documents</h3>
              <div className="space-y-2">
                {["Resume.pdf", "ID Proof.pdf", "Certificate.pdf"].map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <File size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-700 flex-1">{doc}</span>
                    <Download size={16} className="text-blue-600 cursor-pointer" />
                  </div>
                ))}
                <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-600 transition-colors">
                  <Upload size={16} /> Upload Document
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="max-w-4xl mx-auto animate-fade-in" /></DashboardLayout>}>
      <StudentProfileContent />
    </Suspense>
  );
}
