export async function getTagsByName(name: string, excluding?: string) {
  const query = new URLSearchParams({ name });
  if (excluding) query.append('excluding', excluding);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/tags?${query.toString()}`, {
    method: 'GET',
  });

  if (res.ok) {
    return res.json();
  }

  throw new Error(res.statusText);
}

export async function getAllTags() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/tags`, {
    method: 'GET',
  });

  if (res.ok) {
    return res.json();
  }

  throw new Error(res.statusText);
}