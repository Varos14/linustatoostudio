import Container from "@/components/Container";
import Link from "next/link";
import { STUDIO } from "@/lib/config";

export default function ContactPage() {
  return (
    <div className="py-20 animate-fade-in">
      <Container>
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4 animate-slide-up">Contact Us</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto animate-slide-up animation-delay-200">
            The best way to start is to send a booking request. For general questions, reach us via email, phone, or Instagram.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 animate-slide-up animation-delay-400">
          <div className="rounded-xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white mb-6">Get in Touch</h2>
            <div className="space-y-4">
              {STUDIO.phone && (
                <div className="flex items-center space-x-4 group">
                  <span className="text-3xl">📞</span>
                  <a href={`tel:${STUDIO.phone}`} className="text-white/90 hover:text-white transition-colors duration-300">
                    {STUDIO.phone}
                  </a>
                </div>
              )}
              {STUDIO.email && (
                <div className="flex items-center space-x-4 group">
                  <span className="text-3xl">✉️</span>
                  <a href={`mailto:${STUDIO.email}`} className="text-white/90 hover:text-white transition-colors duration-300">
                    {STUDIO.email}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <span className="text-3xl">📍</span>
                <div className="text-white/90">
                  <p>{STUDIO.address}</p>
                  <p>{STUDIO.city}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white mb-6">Follow Us</h2>
            <div className="space-y-4">
              <a href={STUDIO.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 text-white/90 hover:text-white transition-colors duration-300 group">
                <span className="text-3xl">📸</span>
                <span>Instagram</span>
              </a>
              {STUDIO.snapchat && (
                <a href={STUDIO.snapchat} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 text-white/90 hover:text-white transition-colors duration-300 group">
                  <span className="text-3xl">👻</span>
                  <span>Snapchat</span>
                </a>
              )}
              {STUDIO.twitter && (
                <a href={STUDIO.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 text-white/90 hover:text-white transition-colors duration-300 group">
                  <span className="text-3xl">🐦</span>
                  <span>Twitter</span>
                </a>
              )}
            </div>

            <div className="mt-8">
              <Link href="/booking" className="group relative inline-block rounded-lg bg-white text-black px-6 py-3 text-sm font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Book Your Tattoo
                <span className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm animate-slide-up animation-delay-600">
          <h3 className="text-2xl font-semibold text-white mb-4">Business Hours</h3>
          <div className="text-white/80 space-y-2">
            <p>Monday - Friday: 9:00 AM - 7:00 PM</p>
            <p>Saturday: 10:00 AM - 5:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
          <p className="text-white/60 text-sm mt-6">
            * Appointments preferred. Walk-ins welcome based on availability.
          </p>
        </div>
      </Container>
    </div>
  );
}

