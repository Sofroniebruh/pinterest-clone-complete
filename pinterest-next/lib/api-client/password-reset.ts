import { EmailType } from '@/components/auth/schema';

type ResetResponse = {
  message: string
  user: {
    email: string
    id: number
    username: string | null
    pfpUrl: string | null
  }
}

export async function passwordResetRequest(data: EmailType) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/auth/request-password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: data.email }),
  });

  return response.ok;
}

export async function passwordReset(password: string, token: string): Promise<{
  isOk: boolean,
  user: {
    email: string
    id: number
    username: string | null
    pfpUrl: string | null
  }
}> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/auth/reset-password?token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: password }),
  });

  const data = await response.json() as ResetResponse;

  return {
    isOk: response.ok,
    user: data.user,
  };
}