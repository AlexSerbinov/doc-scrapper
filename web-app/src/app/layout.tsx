import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Doc Scrapper - AI Documentation Assistant",
  description: "Інтелектуальний помічник для пошуку та навігації по технічній документації з автоматичними посиланнями на джерела.",
  keywords: ["documentation", "AI", "RAG", "search", "chat", "assistant"],
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
    <html lang="uk">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
