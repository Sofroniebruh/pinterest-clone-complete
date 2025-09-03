import { NextRequest, NextResponse } from 'next/server';
import { uploadPublicImage } from '@/lib/aws/upload/upload-public-image';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const link = await uploadPublicImage({ formData });

  if (!link) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  return NextResponse.json({ link: link }, { status: 200 });
}