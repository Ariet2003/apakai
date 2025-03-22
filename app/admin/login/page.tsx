'use client';

import LoginForm from '@/app/components/LoginForm';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/admin/dashboard');
  };

  return <LoginForm onSuccess={handleLoginSuccess} />;
} 