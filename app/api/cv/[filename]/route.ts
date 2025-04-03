import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  const { filename } = await params;
  const filePath = path.join(process.cwd(), 'uploads', 'cv', filename);

  try {
    const file = await fs.promises.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = 'application/pdf';

    return new NextResponse(file, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

