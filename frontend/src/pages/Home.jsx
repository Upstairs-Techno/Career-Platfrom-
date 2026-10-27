import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, Code2, Briefcase, Users, Award, GitBranch, Lightbulb,
  Sparkles, ShieldCheck, CheckCircle2
} from 'lucide-react'
import ProgramCard from '../components/ProgramCard'
import SectionHeader from '../components/SectionHeader'
import { WhatsAppChatButton } from '../components/WhatsAppButton'
import { Reveal, EASE } from '../components/motion/Motion'

const gains = [
  { icon: Lightbulb, title: 'Practical Experience', desc: 'Apply classroom knowledge to real-world-style technical tasks and production architectures.' },
  { icon: Code2, title: 'Technical Skills', desc: 'Develop in-demand skills in Java, React, Python, Data Science, and Modern Web stacks.' },
  { icon: Briefcase, title: 'Project Portfolio', desc: 'Build and deploy practical, production-ready projects that showcase real ability.' },
  { icon: Users, title: 'Expert Mentorship', desc: 'Receive structured guidance, weekly feedback, and direct code reviews from professionals.' },
  { icon: GitBranch, title: 'Git & Professional Workflows', desc: 'Master branch strategies, PR workflows, code collaboration, and version control.' },
  { icon: Award, title: 'Industry Exposure', desc: 'Understand real agile environments, teamwork standards, and corporate engineering ethics.' },
]

const stats = [
  { label: 'Core Tech Tracks', value: '5+' },
  { label: 'Hands-on Training', value: '60–120 Hrs' },
  { label: 'Project-Based', value: '100%' },
  { label: 'Mentorship & Review', value: '1-on-1' },
]

const featuredTracks = [
  { title: 'Java Full Stack', image: '/javafull stack.png', alt: 'Java full stack development pathway' },
  { title: 'Python & AI', image: '/python.png', alt: 'Python programming pathway' },
  { title: 'AI & Machine Learning', image: '/Aiml.png', alt: 'Artificial intelligence and machine learning pathway' },
]

export default function Home() {
  return (
    <div>
      {/* Hero with a visible image and restrained readability overlay */}
      <section className="relative min-h-[85vh] flex items-start justify-center overflow-hidden border-b border-slate-200/80 bg-white sm:items-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/background ojt.png"
            alt="Upstairs Techno Team and Workspace"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/45 to-white/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/65 via-white/15 to-white/65" />
        </div>

        {/* Content Container */}
        <div className="container-page relative z-10 py-20 sm:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE }}
            className="mx-auto max-w-4xl"
          >
            {/* Tagline Badge with subtle float */}
            <div className="inline-flex items-center gap-2 clay-pill clay-pill-accent animate-float px-4 py-2 text-xs sm:text-sm font-bold text-blue-700 mb-6 font-heading">
              <Sparkles size={14} className="text-blue-600" />
              <span>INNOVATE • INTEGRATE • ELEVATE</span>
            </div>

            {/* Brand Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-tight font-heading">
              UPSTAIRS TECHNO
            </h1>

            {/* Slogan */}
            <p className="mt-3 text-base sm:text-xl font-black uppercase tracking-[0.3em] text-blue-600 font-heading">
              Learn • Build • Grow
            </p>

            {/* Value Proposition */}
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-xl leading-relaxed text-slate-700 font-medium">
              Practical learning, real-world project experience, and professional engineering exposure for ambitious engineering and IT students.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="#programs" className="btn-primary w-full sm:w-auto text-base !px-8 !py-3.5">
                Explore Programs <ArrowRight size={18} />
              </a>
              <Link to="/ojt/apply" className="btn-secondary w-full sm:w-auto text-base !px-8 !py-3.5">
                Apply Now <ArrowUpRight size={18} />
              </Link>
            </div>

            {/* Quick Metrics Bar in Light Theme with Clay Treatment */}
            <div className="mt-14 grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4 max-w-3xl mx-auto">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="clay-card clay-card-hover !p-5 text-center !rounded-2xl"
                >
                  <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 font-heading">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-600 font-heading">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Program cards section */}
      <section id="programs" className="border-b border-slate-200/80 bg-slate-50/70 py-24">
        <div className="container-page">
          <SectionHeader
            eyebrow="Choose Your Path"
            title="Structured Career Pathways"
            description="Industry-aligned training and internship programs designed to transform classroom theory into tangible engineering capability."
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 max-w-5xl mx-auto">
            <ProgramCard
              icon={Code2}
              title="OJT Program"
              subtitle="On-the-Job Training"
              description="Intensive, hands-on training where you build real software modules under expert guidance with structured milestones and evaluations."
              exploreHref="/ojt"
              applyHref="/ojt/apply"
            />
            <ProgramCard
              icon={Briefcase}
              title="Internship Program"
              subtitle="Industry Internship"
              description="Work on end-to-end technical deliverables, solve real application requirements, and gain verified professional experience for your career."
              exploreHref="/internship"
              applyHref="/internship/apply"
            />
          </div>
        </div>
      </section>

      {/* Featured technical tracks */}
      <section className="border-b border-slate-200/80 bg-slate-950 py-20 text-white">
        <div className="container-page">
          <SectionHeader
            eyebrow="Build In Demand Skills"
            title="Choose a Technical Direction"
            description="Explore the technologies behind our guided learning tracks and build a portfolio around the work you want to do next."
            dark
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featuredTracks.map((track) => (
              <div key={track.title} className="group overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-xl shadow-slate-950/20">
                <div className="aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={track.image}
                    alt={track.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="px-5 py-5 text-lg font-bold tracking-tight">{track.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What students gain */}
      <section className="bg-white py-24 border-b border-slate-200/80">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow="Why UPSTAIRS TECHNO"
              title="What You Gain From Our Programs"
              description="Everything you need to step confidently from college into the competitive technology industry."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gains.map((g, i) => (
              <Reveal key={g.title} delay={i * 0.05}>
                <div className="clay-card clay-card-hover h-full flex flex-col p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-clay-pill transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                    <g.icon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-slate-900 tracking-tight font-heading">{g.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 flex-1">{g.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Real Workplace Experience Banner */}
      <section className="container-page py-20">
        <Reveal>
          <div className="clay-card !p-8 sm:!p-12 !border-blue-100/90 bg-gradient-to-br from-blue-50/70 via-white to-sky-50/50">
            <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 clay-pill clay-pill-accent mb-4 text-xs font-bold font-heading">
                  <CheckCircle2 size={14} className="text-blue-600" /> Real Industry Culture
                </div>
                <h2 className="text-3xl font-black text-slate-900 sm:text-4xl leading-tight font-heading">
                  Learn Inside A Collaborative Software Environment
                </h2>
                <p className="mt-4 text-slate-600 text-base leading-relaxed">
                  At Upstairs Techno, you collaborate on actual codebases, work with modern tools like Git, Docker, and IDEs, and participate in peer discussions that model high-performing tech teams.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link to="/ojt/apply" className="btn-primary !px-6 !py-3 text-sm">
                    Apply for OJT <ArrowUpRight size={16} />
                  </Link>
                  <Link to="/internship" className="btn-secondary !px-6 !py-3 text-sm">
                    View Track Details <ArrowRight size={16} />
                  </Link>
                  <WhatsAppChatButton size="md" label="Chat on WhatsApp" />
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-clay-card group">
                <img
                  src="/it_industry.jpg"
                  alt="Technology and industry collaboration"
                  className="h-64 sm:h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-xs font-bold text-slate-900 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-clay-pill font-heading">
                  🚀 Students in live project sprint at UPSTAIRS TECHNO
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Important Academic / Policy note */}
      <section className="container-page pb-20">
        <Reveal>
          <div className="clay-card !border-amber-200/80 !bg-amber-50/60 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-amber-100/70 text-amber-700 shadow-clay-pill">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-amber-950 font-heading">Program Transparency & Academic Policy</h3>
                <p className="mt-2 text-sm leading-relaxed text-amber-900">
                  Our OJT and Internship programs are intended for professional learning, practical skill development, and portfolio preparation. Completion of a program provides valuable experience and verified documentation; it does not automatically guarantee employment, university credits, or college clearance. Academic recognition depends on your individual college/university guidelines.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
