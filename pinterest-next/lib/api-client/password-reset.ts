import { EmailType } from '@/components/auth/schema';

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

export async function passwordReset(password: string, token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/auth/reset-password?token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: password }),
  });

  return response.ok;
}