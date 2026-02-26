import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth/AuthProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ساس — منصة التجارة الإلكترونية',
    template: '%s | ساس',
  },
  description: 'منصة تجارة إلكترونية سحابية تمكّن التجار من إنشاء وإدارة متاجرهم الرقمية بسهولة',
  keywords: ['تجارة إلكترونية', 'متجر إلكتروني', 'ساس', 'SaaS', 'ecommerce'],
  authors: [{ name: 'ساس' }],
  openGraph: {
    type: 'website',
    locale: 'ar_QA',
    siteName: 'ساس',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
        <meta name="theme-color" content="#660033" />
      </head>
      <body className="font-ibm antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
