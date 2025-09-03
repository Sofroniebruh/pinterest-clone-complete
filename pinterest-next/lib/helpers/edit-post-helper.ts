'use client';

import { generatePresignedURL } from '@/lib/aws/presigned-url-generator';

export const handleDownload = async (link: string) => {
  const download = document.createElement('a');
  download.href = await generatePresignedURL(link.split('.com/')[1]);
  download.download = 'pinterest-image.jpg';
  document.body.appendChild(download);
  download.click();
  document.body.removeChild(download);
};