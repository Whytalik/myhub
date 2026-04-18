import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MyHub",
    template: "%s | MyHub",
  },
  description: "Personal operating system for food planning and habits.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text font-sans antialiased scrollbar-hide">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1712',
              border: '1px solid #2c271f',
              color: '#ffffff',
              fontFamily: 'var(--font-inter)',
            }
          }}
        />
      </body>
    </html>
  );
}
