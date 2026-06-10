import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ParticleBackground from "@/components/particle-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invenio // Innovation Discovery Engine",
  description: "Accelerating SaaS breakthroughs and R&D pipelines using next-generation intelligence representation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col relative font-sans overflow-x-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-glow/10 blur-[150px] pointer-events-none animate-pulse-slow z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-glow/10 blur-[150px] pointer-events-none animate-pulse-slow z-0" />

        {/* Global Particle Background */}
        <ParticleBackground />

        {/* Root content */}
        <div className="relative z-10 flex flex-col flex-1 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
