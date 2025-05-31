import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Doc Scrapper AI - Розблокуйте Силу Вашої Документації",
  description: "Миттєво перетворіть вашу онлайн-документацію на інтерактивного AI-помічника. Отримуйте відповіді, а не просто результати пошуку.",
  keywords: "AI документація, скрапінг документації, AI асистент, машинне навчання",
  authors: [{ name: "Alex Serbinov" }],
  openGraph: {
    title: "Doc Scrapper - AI Documentation Assistant",
    description: "Знайдіть відповіді у документації миттєво з допомогою AI",
    type: "website",
    locale: "uk_UA",
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
    <html lang="uk" className="dark">
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
