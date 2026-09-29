import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-white/5 py-12 text-sm text-neutral-400">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-xl font-bold tracking-tighter text-white mb-4 block">SMT</Link>
            <p className="max-w-xs leading-relaxed">
              Empowering students to showcase their brilliant ideas and connect with industry professionals.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/projects" className="hover:text-indigo-400 transition-colors">Projects</Link></li>
              <li><Link href="/blogs" className="hover:text-indigo-400 transition-colors">Blogs</Link></li>
              <li><Link href="/news" className="hover:text-indigo-400 transition-colors">News</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Portals</h4>
            <ul className="space-y-2">
              <li><Link href="/student/dashboard" className="hover:text-indigo-400 transition-colors">Student Portal</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-indigo-400 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 SMT Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}