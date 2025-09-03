import { UseFormReturn } from 'react-hook-form';

interface Props {
  registerForm?: UseFormReturn<{
    email: string
    password: string
    confirmPassword: string
  }, any, {
    email: string
    password: string
    confirmPassword: string
  }>;
  loginForm?: UseFormReturn<{
    email: string
    password: string
  }, any, {
    email: string
    password: string
  }>;
}

export const HandleNextStage = async ({ registerForm, loginForm }: Props) => {
  return registerForm ? await registerForm.trigger(['email']) : await loginForm!.trigger(['email']);
};