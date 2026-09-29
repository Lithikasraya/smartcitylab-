import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col font-sans selection:bg-indigo-500/30">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950 to-neutral-950"></div>
          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8 border border-indigo-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              SMT Platform 2026 Batch Open
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Showcase Your <br className="hidden md:block" /> Brilliant Ideas
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              The premier platform for students to submit, manage, and showcase their academic projects to the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/projects" className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]">
                Explore Projects
              </Link>
              <Link href="/student/dashboard" className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium transition-all border border-white/10 backdrop-blur-sm">
                Student Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="py-24 bg-neutral-900/50">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Projects</h2>
                <p className="text-neutral-400">Discover top submissions from our students.</p>
              </div>
              <Link href="/projects" className="text-indigo-400 hover:text-indigo-300 font-medium group flex items-center gap-2">
                View all <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="group rounded-2xl bg-neutral-900 border border-white/5 overflow-hidden hover:border-indigo-500/30 transition-all hover:shadow-[0_0_30px_-15px_rgba(79,70,229,0.3)]">
                  <div className="aspect-video bg-neutral-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-700"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md">Web App</span>
                      <span className="text-xs font-medium px-2 py-1 bg-neutral-800 text-neutral-400 rounded-md">2026</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Project Title {i}</h3>
                    <p className="text-neutral-400 text-sm line-clamp-2 mb-4">A brief description of what this project does and the problem it solves for the target audience.</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-neutral-700"></div>
                        <span className="text-sm font-medium">Student Name</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}