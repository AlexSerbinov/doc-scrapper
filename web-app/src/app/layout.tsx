import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { currentLanguage, t } from "@/locales";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: t('metadata.title'),
  description: t('metadata.description'),
  keywords: t('metadata.keywords'),
  authors: [{ name: "Alex Serbinov" }],
  openGraph: {
    title: t('metadata.ogTitle'),
    description: t('metadata.ogDescription'),
    type: "website",
    locale: currentLanguage === 'ua' ? "uk_UA" : "en_US",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={currentLanguage === 'ua' ? 'uk' : 'en'} className="dark">
      <body className={inter.className}>
        {/* Global cosmic background stars */}
        <div className="global-cosmic-stars"></div>
        
        <Header />
        <main className="min-h-screen relative z-0">
        {children}
        </main>
      </body>
    </html>
  );
}
