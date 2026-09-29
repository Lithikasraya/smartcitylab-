import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-black">S</span>
          </div>
          SMT
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
          <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
          <Link href="/blogs" className="hover:text-white transition-colors">Blogs</Link>
          <Link href="/news" className="hover:text-white transition-colors">News</Link>
          <Link href="/batches" className="hover:text-white transition-colors">Batches</Link>
          <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/student/dashboard" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/student/submit" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors">
            Submit Project
          </Link>
        </div>
      </div>
    </nav>
  );
}