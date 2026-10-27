import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { WhatsAppChatButton } from '../components/WhatsAppButton'
import { Reveal } from '../components/motion/Motion'

const whoCanApply = [
  'BCS students', 'BCA students', 'B.Tech / BE students', 'Diploma students', 'MCA students',
  'Computer Science students', 'IT students', 'Pre-final-year students', 'Final-year students',
  'Recent graduates (where applicable)',
]

const domains = [
  'Web Development', 'Java Development', 'Python Development', 'AI & Machine Learning',
  'Data Science', 'Cybersecurity', 'Full Stack Development',
]

const durations = ['1 Month', '2 Months', '3 Months', '6 Months']

const learningStages = ['Learn', 'Work', 'Build', 'Review', 'Complete']

export default function InternshipPage() {
  return (
    <div className="bg-white">
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-20 text-center sm:py-24">
        <div className="absolute inset-0 z-0">
          <img
            src="/background ojt.png"
            alt="Upstairs Techno Internship Environment"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/50 to-white/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/65 via-white/15 to-white/65" />
        </div>

        <div className="container-page relative z-10">
          <span className="inline-block clay-pill clay-pill-accent mb-4 font-heading text-xs font-bold uppercase tracking-[0.25em]">
            Industry Internship Program
          </span>
          <h1 className="text-4xl font-black text-slate-900 sm:text-5xl lg:text-6xl tracking-tight font-heading">
            INTERNSHIP PROGRAM
          </h1>
          <p className="mt-3 text-sm sm:text-base font-black uppercase tracking-[0.3em] text-blue-600 font-heading">
            Learn • Build • Grow
          </p>
        </div>
      </section>

      {/* Program Description */}
      <section className="container-page py-20">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeader
              eyebrow="Industry Immersion"
              title="Accelerate With Verified Project Experience"
            />
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-700">
              UPSTAIRS TECHNO provides structured industry internship opportunities designed to help students
              gain practical software exposure, contribute to real technical deliverables, develop modern engineering
              competencies, and understand professional workflows.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Eligibility */}
      <section className="border-y border-slate-200/80 bg-slate-50/70 py-20">
        <div className="container-page">
          <SectionHeader eyebrow="Eligibility" title="Who Can Apply?" />
          <div className="mt-12 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {whoCanApply.map((item, i) => (
              <Reveal key={item} delay={i * 0.03}>
                <div className="flex items-center gap-3.5 clay-card !p-4 !rounded-xl transition-all">
                  <CheckCircle2 size={18} className="shrink-0 text-blue-600" />
                  <span className="text-sm font-bold text-slate-800 font-heading">{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="container-page py-20">
        <SectionHeader eyebrow="Technology Domains" title="Specialized Internship Tracks" />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 max-w-5xl mx-auto">
          {domains.map((d, i) => (
            <Reveal key={d} delay={i * 0.04}>
              <div className="clay-card clay-card-hover text-center !p-6 flex items-center justify-center min-h-[90px]">
                <p className="font-bold text-slate-900 text-base font-heading">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Durations */}
      <section className="border-y border-slate-200/80 bg-slate-50/70 py-20">
        <div className="container-page">
          <SectionHeader eyebrow="Flexible Schedule" title="Internship Durations" />
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto">
            {durations.map((d, i) => (
              <Reveal key={d} delay={i * 0.05}>
                <div className="clay-card clay-card-hover text-center !p-6">
                  <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 font-heading">
                    {d}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">Structured Track</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Learning approach */}
      <section className="container-page py-20 text-slate-800">
        <SectionHeader eyebrow="Our Approach" title="Internship Progression Stages" center />
        <div className="mt-14 flex flex-col items-center gap-6 sm:flex-row sm:justify-between max-w-5xl mx-auto">
          {learningStages.map((stage, i) => (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-lg font-black text-blue-700 shadow-clay-pill font-heading">
                  {i + 1}
                </div>
                <p className="mt-3 font-bold text-slate-800 font-heading">{stage}</p>
              </div>
              {i < learningStages.length - 1 && (
                <ArrowRight className="hidden text-slate-400 sm:block" size={22} />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-2xl text-center text-slate-600 text-sm leading-relaxed">
          Students receive consistent mentorship, sprint-based milestone reviews, and code guidance throughout the internship.
        </p>
      </section>

      {/* Apply CTA */}
      <section className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-blue-50/30 py-20 text-center">
        <div className="container-page">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-clay-pill mb-4">
            <Sparkles size={28} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl font-heading">Ready to Start Your Internship?</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
            Apply today to secure your domain track and build verified project credentials for your resume.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/internship/apply" className="btn-primary text-base !px-8 !py-3.5 w-full sm:w-auto">
              Apply for Internship Now <ArrowRight size={18} />
            </Link>
            <WhatsAppChatButton size="lg" label="Chat on WhatsApp" className="w-full sm:w-auto" />
          </div>
        </div>
      </section>
    </div>
  )
}
