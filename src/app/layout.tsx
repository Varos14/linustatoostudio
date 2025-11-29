import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { STUDIO } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${STUDIO.name} — ${STUDIO.tagline}`,
  description:
    "Professional tattoo studio website with gallery, artists, and booking.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: `${STUDIO.name} — ${STUDIO.tagline}`,
    description:
      "Book a consultation and explore our portfolio of fine line and custom tattoos.",
    url: "/",
    siteName: STUDIO.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${STUDIO.name} — ${STUDIO.tagline}`,
    description:
      "Book a consultation and explore our portfolio of fine line and custom tattoos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
