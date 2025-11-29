"use client";

import Link from "next/link";
import { STUDIO } from "@/lib/config";

const nav = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/artists", label: "Artists" },
  { href: "/booking", label: "Booking" },
  { href: "/faq", label: "FAQ" },
  { href: "/aftercare", label: "Aftercare" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur bg-background/70">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl tracking-wide">
          {STUDIO.name}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-white/90 text-white/70"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="md:hidden">
          <a
            href={STUDIO.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-white/10 px-3 py-1.5 hover:bg-white/5 text-white/80"
          >
            IG
          </a>
        </div>
      </div>
    </header>
  );
}

