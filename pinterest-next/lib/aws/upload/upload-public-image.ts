import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  formData: FormData;
}

export const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY!,
  },
});

export const uploadPublicImage = async ({ formData }: Props) => {
  const file = formData.get('file') as File;

  if (!file) {
    return null;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExtension = file.name.split('.').pop();
  const key = `uploads/${uuidv4()}.${fileExtension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
};