import { NextResponse } from 'next/server';
import { INITIAL_SUBMISSIONS, SubmissionItem } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');

  let list = INITIAL_SUBMISSIONS;
  if (status && status !== 'all') {
    list = list.filter(s => s.status === status);
  }
  if (type && type !== 'all') {
    list = list.filter(s => s.type === type);
  }

  return NextResponse.json({
    success: true,
    count: list.length,
    data: list,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.summary) {
      return NextResponse.json(
        { success: false, error: 'Title and summary are required' },
        { status: 400 }
      );
    }

    const newSub: SubmissionItem = {
      id: `sub-${Date.now()}`,
      type: body.type || 'project',
      title: body.title,
      summary: body.summary,
      studentName: body.studentName || 'Student Intern',
      studentRoll: body.studentRoll || '2300290100098',
      teamName: body.teamName || 'Team CyberVision',
      submittedAt: new Date().toLocaleString(),
      status: 'pending',
      details: body.details || {},
    };

    return NextResponse.json({
      success: true,
      message: 'Submission queued for Super Admin review',
      data: newSub,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to process submission' }, { status: 500 });
  }
}