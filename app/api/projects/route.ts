import { NextResponse } from 'next/server';
import { INITIAL_PROJECTS, ProjectItem } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const batch = searchParams.get('batch');

  let filtered = INITIAL_PROJECTS;
  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (batch && batch !== 'All') {
    filtered = filtered.filter(p => p.batchYear === batch);
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const newProject: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: body.title,
      tagline: body.tagline || body.title,
      description: body.description,
      category: body.category || 'AI & Computer Vision',
      batchYear: body.batchYear || '2026',
      teamName: body.teamName || 'Team CyberVision',
      teamLead: body.teamLead || 'Aarav Sharma',
      members: body.members || ['Student Intern'],
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      demoUrl: body.demoUrl,
      repoUrl: body.repoUrl,
      status: 'pending',
      views: 0,
      featured: false,
      publishedAt: new Date().toISOString().split('T')[0],
      techStack: body.techStack || ['Next.js', 'IoT'],
    };

    return NextResponse.json({
      success: true,
      message: 'Project submitted for Super Admin approval',
      data: newProject,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 500 });
  }
}