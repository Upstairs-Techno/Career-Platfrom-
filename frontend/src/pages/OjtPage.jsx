import React from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, Clock, Monitor, CheckCircle2, FileText, Sparkles, ArrowRight,
} from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { WhatsAppChatButton } from '../components/WhatsAppButton'
import { Reveal } from '../components/motion/Motion'

const whoCanApply = [
  'BCS students', 'BCA students', 'B.Tech / BE students', 'Diploma students',
  'Computer Science students', 'IT students', 'Pre-final-year students',
  'Final-year students', 'Students looking for practical IT experience',
]

const durations = ['4 Weeks', '6 Weeks', '8 Weeks', '12 Weeks']

const learningStages = ['Learn', 'Practice', 'Build', 'Evaluate', 'Complete']

const tracks = [
  {
    name: 'Web Development',
    topics: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design', 'Git', 'GitHub', 'Project Development'],
    outcome: 'Students build a practical web project that can be included in their portfolio.',
  },
  {
    name: 'Java Development',
    topics: ['Core Java', 'OOP', 'Collections', 'Exception Handling', 'Database Fundamentals', 'Git', 'GitHub'],
    outcome: 'Students develop a Java-based practical application/project.',
  },
  {
    name: 'Python & AI',
    topics: ['Python Programming', 'Data Handling', 'Automation', 'APIs', 'AI Fundamentals', 'ML Basics'],
    outcome: 'Students complete a practical Python/AI-related project.',
  },
  {
    name: 'Cybersecurity',
    topics: ['Cybersecurity Fundamentals', 'Networking Basics', 'Security Principles', 'Web Security', 'Threat Awareness'],
    outcome: 'Students complete practical cybersecurity exercises/projects under appropriate supervision.',
  },
  {
    name: 'AI & Data Science',
    topics: ['Python', 'Data Analysis', 'Data Visualization', 'Statistics', 'ML Basics', 'AI Concepts'],
    outcome: 'Students work on a practical data/AI project.',
  },
]

const process = [
  { step: '01', title: 'Apply', desc: 'Student submits OJT application.' },
  { step: '02', title: 'Selection', desc: 'Student receives selection/confirmation details.' },
  { step: '03', title: 'Join', desc: 'Student begins selected OJT.' },
  { step: '04', title: 'Train', desc: 'Student completes training, assignments and activities.' },
  { step: '05', title: 'Project', desc: 'Student completes assigned project.' },
  { step: '06', title: 'Evaluation', desc: "Student's work is evaluated." },
  { step: '07', title: 'Complete', desc: 'Successful students receive applicable completion documentation.' },
]

const documents = [
  'OJT Selection / Offer Letter',
  'OJT Joining Confirmation',
  'Training / Attendance Record',
  'Project Completion Certificate',
  'Letter of Recommendation (Performance-based)',
]

export default function OjtPage() {
  return (
    <div>
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-20 text-center sm:py-24">
        <div className="absolute inset-0 z-0">
          <img
            src="/background ojt.png"
            alt="Upstairs Techno OJT Environment"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/50 to-white/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/65 via-white/15 to-white/65" />
        </div>

        <div className="container-page relative z-10">
          <span className="inline-block clay-pill clay-pill-accent mb-4 font-heading text-xs font-bold uppercase tracking-[0.25em]">
            Hands-on Technical Training
          </span>
          <h1 className="text-4xl font-black text-slate-900 sm:text-5xl lg:text-6xl tracking-tight font-heading">
            ON-THE-JOB TRAINING
          </h1>
          <p className="mt-3 text-sm sm:text-base font-black uppercase tracking-[0.3em] text-blue-600 font-heading">
            Learn • Build • Grow
          </p>
        </div>
      </section>

      {/* What is OJT */}
      <section className="container-page py-20">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeader
              eyebrow="Overview"
              title="What is OJT at UPSTAIRS TECHNO?"
            />
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-700">
              On-the-Job Training (OJT) is a practical, industry-focused training program where students
              gain hands-on experience by working on real technical tasks and software modules under the
              guidance of industry professionals.
            </p>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600">
              The program bridges the gap between theoretical classroom learning and modern IT engineering
              by developing technical skills, problem-solving habits, teamwork, professional coding practices,
              and substantial portfolio projects.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Who can apply */}
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

      {/* Duration, hours, mode */}
      <section className="container-page py-20">
        <SectionHeader eyebrow="Program Structure" title="Duration, Hours & Mode" />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto">
          {durations.map((d, i) => (
            <Reveal key={d} delay={i * 0.05}>
              <div className="clay-card clay-card-hover text-center !p-6">
                <Clock className="mx-auto text-blue-600" size={26} />
                <p className="mt-3 text-lg font-black text-slate-900 font-heading">{d}</p>
                <p className="text-xs text-slate-500 font-medium">Structured sprints</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
          <div className="clay-card !p-6 text-center">
            <GraduationCap className="mx-auto text-blue-600" size={26} />
            <p className="mt-3 text-base font-bold text-slate-900 font-heading">60 to 120 Hours</p>
            <p className="mt-1 text-xs text-slate-500">Flexible training & project schedule</p>
          </div>
          <div className="clay-card !p-6 text-center">
            <Monitor className="mx-auto text-blue-600" size={26} />
            <p className="mt-3 text-base font-bold text-slate-900 font-heading">Hybrid / Offline</p>
            <p className="mt-1 text-xs text-slate-500">Practical labs & remote tasks</p>
          </div>
          <div className="clay-card !p-6 text-center">
            <CheckCircle2 className="mx-auto text-blue-600" size={26} />
            <p className="mt-3 text-base font-bold text-slate-900 font-heading">Active Feedback</p>
            <p className="mt-1 text-xs text-slate-500">Regular milestones & mentor check-ins</p>
          </div>
        </div>

        {/* 5 Stages */}
        <div className="mt-12 max-w-4xl mx-auto clay-card !p-8 bg-gradient-to-r from-blue-50/50 via-white to-sky-50/50">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-600 font-heading">
            Progressive Learning Model
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {learningStages.map((stage, idx) => (
              <React.Fragment key={stage}>
                <div className="clay-pill clay-pill-accent px-4 py-2 text-sm font-bold font-heading">
                  {stage}
                </div>
                {idx < learningStages.length - 1 && (
                  <ArrowRight size={16} className="text-blue-300 hidden sm:inline" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="border-t border-slate-200/80 bg-slate-50/70 py-20">
        <div className="container-page">
          <SectionHeader
            eyebrow="Specializations"
            title="Available Technical Tracks"
            description="Choose the area you want to develop and complete a portfolio-grade project."
          />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4">
          {tracks.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.05}>
              <div className="clay-card clay-card-hover h-full flex flex-col p-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight font-heading">{t.name}</h3>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {t.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 font-heading"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <p className="mt-5 flex-1 text-sm italic leading-relaxed text-slate-600 border-t border-slate-100 pt-4">
                  &ldquo;{t.outcome}&rdquo;
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Completion process */}
      <section className="border-y border-slate-200/80 bg-white py-20">
        <div className="container-page">
          <SectionHeader eyebrow="Structured Flow" title="OJT Completion Process" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {process.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.04}>
                <div className="clay-card clay-card-hover h-full p-6">
                  <span className="text-3xl font-black text-blue-300 font-heading">{p.step}</span>
                  <h3 className="mt-2 text-lg font-black text-slate-900 font-heading">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="container-page py-20">
        <SectionHeader eyebrow="Documentation" title="Official OJT Deliverables" />
        <div className="mt-12 grid gap-3.5 sm:grid-cols-2 max-w-4xl mx-auto">
          {documents.map((d, i) => (
            <Reveal key={d} delay={i * 0.04}>
              <div className="flex items-center gap-3.5 clay-card !p-4 !rounded-xl">
                <FileText size={18} className="shrink-0 text-blue-600" />
                <span className="text-sm font-bold text-slate-800 font-heading">{d}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs italic text-slate-500">
          * Documentation validates training participation, project deliverables, and skill milestones.
        </p>
      </section>

      {/* Apply CTA */}
      <section className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-blue-50/30 py-20 text-center">
        <div className="container-page">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-clay-pill mb-4">
            <Sparkles size={28} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl font-heading">Ready to Start Your OJT?</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
            Submit your application today and take the first decisive step towards your software engineering career.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/ojt/apply" className="btn-primary text-base !px-8 !py-3.5 w-full sm:w-auto">
              Apply for OJT Now <ArrowRight size={18} />
            </Link>
            <WhatsAppChatButton size="lg" label="Chat on WhatsApp" className="w-full sm:w-auto" />
          </div>
        </div>
      </section>
    </div>
  )
}
