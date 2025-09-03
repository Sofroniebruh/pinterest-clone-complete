import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '@/lib/aws/upload/upload-public-image';

export const generatePresignedURL = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: 'bucket-for-pinterest-clone',
    Key: key,
    ResponseContentDisposition: 'attachment; filename="downloaded-image.jpg"',
  });

  return await getSignedUrl(s3, command, { expiresIn: 3600 });
};
