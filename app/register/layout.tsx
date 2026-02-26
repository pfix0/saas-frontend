import AuthLayout from '@/components/auth/AuthLayout';

export default function RegisterLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
