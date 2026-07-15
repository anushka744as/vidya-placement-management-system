"use client";

import Link from "next/link";
import {
  GraduationCap,
  Briefcase,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
  Target,
  Heart,
  Award,
  Building2,
  MapPin,
} from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/image.png" alt="Vidya" width={40} height={40} />
            <div>
              <p className="font-bold text-gray-900 leading-tight">Vidya</p>
              <p className="text-xs text-gray-400 leading-tight">Placement Management</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#stats" className="hover:text-blue-600 transition-colors">Impact</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-50">
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-100 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-40 w-64 h-64 bg-orange-100 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-full mb-6">
              <Heart size={14} /> NGO Placement Initiative
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Bridging the gap between <span className="text-blue-600">skills</span> and{" "}
              <span className="text-orange-500">opportunity</span>
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl leading-relaxed">
              Vidya Placement Management System empowers students from underserved communities
              with skill development and connects them to meaningful employment opportunities
              across India.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 transition-all"
              >
                Access Portal <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">How VPMS Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A complete placement management system designed for NGOs to track, manage, and
              scale student placements efficiently.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: "Skill Tracking", desc: "Monitor student courses, certifications, and skill development progress in real time.", color: "blue" },
              { icon: Briefcase, title: "Job Matching", desc: "Connect students with relevant job opportunities based on their skills and preferences.", color: "orange" },
              { icon: TrendingUp, title: "Placement Analytics", desc: "Track placement rates, salary trends, and retention metrics across all centers.", color: "green" },
              { icon: Users, title: "Student Management", desc: "Comprehensive profiles with education, skills, documents, and placement timelines.", color: "blue" },
              { icon: Target, title: "Career Guidance", desc: "Resume builder, interview scheduling, and application tracking for every student.", color: "orange" },
              { icon: Award, title: "Certification", desc: "Verify and manage course completion certificates and skill validations.", color: "green" },
            ].map((f, i) => (
              <div
                key={i}
                className="group p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-gray-200 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  f.color === "blue" ? "bg-blue-50 text-blue-600" :
                  f.color === "orange" ? "bg-orange-50 text-orange-600" :
                  "bg-green-50 text-green-600"
                }`}>
                  <f.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Our Impact</h2>
            <p className="text-gray-500">Real numbers, real lives changed.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "2,847", label: "Students Enrolled", icon: Users, color: "text-blue-600" },
              { value: "1,678", label: "Students Placed", icon: Briefcase, color: "text-green-600" },
              { value: "156", label: "Active Jobs", icon: Building2, color: "text-orange-500" },
              { value: "84%", label: "Retention Rate", icon: TrendingUp, color: "text-blue-600" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-md transition-shadow">
                <s.icon size={28} className={`mx-auto mb-3 ${s.color}`} />
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/20 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to transform lives?</h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                Join the VPMS portal to manage student placements, track progress, and create
                lasting impact in communities across India.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 hover:shadow-xl transition-all"
              >
                Get Started <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src="/images/image.png" alt="Vidya" width={32} height={32} />
                <p className="font-bold text-white">Vidya</p>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Empowering youth through skill development and meaningful employment.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Platform</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><a href="#stats" className="hover:text-white transition-colors">Impact</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Centers</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-1.5"><MapPin size={12} /> Mumbai</li>
                <li className="flex items-center gap-1.5"><MapPin size={12} /> Delhi</li>
                <li className="flex items-center gap-1.5"><MapPin size={12} /> Bangalore</li>
                <li className="flex items-center gap-1.5"><MapPin size={12} /> Pune</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Contact</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>info@vidya.org</li>
                <li>+91 22 1234 5678</li>
                <li>Mumbai, India</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">© 2024 Vidya NGO. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
