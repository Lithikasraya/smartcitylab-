import { NextResponse } from 'next/server';

export async function GET() { return NextResponse.json({ message: "Projects API" }); }
export async function POST() { return NextResponse.json({ message: "Create Project" }); }