import { NextResponse } from 'next/server';
import { ProjectItem } from '@/lib/data';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { sanitizeForFirestore } from '@/lib/firebaseService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const batch = searchParams.get('batch');
    const status = searchParams.get('status');
    const onlyLive = searchParams.get('live') === 'true';

    let projects: ProjectItem[] = [];

    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, 'projects'));
        const snap = await getDocs(q);
        snap.forEach((d) => {
          projects.push({ id: d.id, ...d.data() } as ProjectItem);
        });
      } catch (err: unknown) {
        console.warn('Backend Firestore fetch note:', err);
      }
    }

    // Apply filtering
    let filtered = projects;

    if (onlyLive) {
      filtered = filtered.filter(
        (p) => p.isVisible !== false && p.status !== 'rejected' && p.status !== 'pending'
      );
    } else if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    if (category && category !== 'All') {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (batch && batch !== 'All') {
      filtered = filtered.filter((p) => p.batchYear === batch);
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: msg, data: [] }, { status: 500 });
  }
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

    const projectId = body.id || `proj-${Date.now()}`;
    const newProject: ProjectItem = {
      id: projectId,
      title: body.title,
      tagline: body.tagline || body.title,
      description: body.description,
      category: body.category || 'IoT & Sensors',
      batchYear: body.batchYear || 'Cream Layer I',
      teamName: body.teamName || 'Smart City Lab Team',
      teamLead: body.teamLead || 'Aarav Sharma',
      members: body.members || ['Student Researcher'],
      imageUrl:
        body.imageUrl ||
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      images: body.images || [],
      videoUrl: body.videoUrl,
      demoUrl: body.demoUrl,
      repoUrl: body.repoUrl,
      status: body.status || 'approved',
      isVisible: body.isVisible !== undefined ? body.isVisible : true,
      views: body.views || 0,
      featured: body.featured || false,
      publishedAt: body.publishedAt || new Date().toISOString().split('T')[0],
      techStack: body.techStack || ['Next.js', 'IoT', 'Embedded Systems'],
    };

    if (isFirebaseConfigured) {
      try {
        const projRef = doc(db, 'projects', projectId);
        await setDoc(projRef, sanitizeForFirestore(newProject), { merge: true });
      } catch (err: unknown) {
        console.warn('Backend Firestore save note:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Project successfully saved and published',
      data: newProject,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid payload';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Project ID required' }, { status: 400 });
    }

    if (isFirebaseConfigured) {
      const projRef = doc(db, 'projects', body.id);
      await setDoc(projRef, sanitizeForFirestore(body), { merge: true });
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated in backend',
      data: body,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Update error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Project ID required' }, { status: 400 });
    }

    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'projects', id));
    }

    return NextResponse.json({ success: true, message: 'Project deleted' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Delete error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}