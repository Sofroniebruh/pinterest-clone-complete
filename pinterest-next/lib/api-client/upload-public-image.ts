export async function uploadPublicImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/upload-public-image`, {
    method: 'POST',
    body: formData,
  });

  if (res.ok) {
    const image = (await res.json()) as { link: string };
    return image.link;
  }

  return new Error(res.statusText);
}