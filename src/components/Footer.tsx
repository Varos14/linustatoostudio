import Link from "next/link";
import { STUDIO } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3 text-sm text-white/70">
        <div>
          <div className="font-serif text-lg text-white">{STUDIO.name}</div>
          <p className="mt-2">{STUDIO.tagline}</p>
          <div className="mt-4 flex items-center gap-4">
            <a href={STUDIO.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>
            {STUDIO.email && (
              <a href={`mailto:${STUDIO.email}`} className="hover:text-white">Email</a>
            )}
          </div>
        </div>
        <div>
          <div className="text-white/90 mb-2">Studio</div>
          <ul className="space-y-1">
            <li>Address: {STUDIO.address || "Add address"}</li>
            <li>Phone: {STUDIO.phone || "Add phone"}</li>
            <li>City: {STUDIO.city || "Add city"}</li>
          </ul>
        </div>
        <div>
          <div className="text-white/90 mb-2">Navigate</div>
          <ul className="space-y-1">
            <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link href="/artists" className="hover:text-white">Artists</Link></li>
            <li><Link href="/booking" className="hover:text-white">Booking</Link></li>
            <li><Link href="/aftercare" className="hover:text-white">Aftercare</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {STUDIO.name}. All rights reserved.
      </div>
    </footer>
  );
}

