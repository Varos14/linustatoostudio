import Link from "next/link";
import Image from "next/image";
import Container from "@/components/Container";
import { STUDIO } from "@/lib/config";
import Hero from "@/components/Hero";

export default function Home() {
  const galleryImages = [
    "/WhatsApp Image 2025-10-07 at 12.55.41_71efb83d.jpg",
    "/neck tatoo.jpg",
    "/chest tatoo.jpg",
    "/waist tatoo.jpg",
    "/hand tatoo.jpg",
    "/2 hand.jpg"
  ];

  const artists = [
    {
      name: "Linus",
      image: "/WhatsApp Image 2025-10-07 at 12.55.41_71efb83d.jpg",
      specialty: "Fine line, blackwork, minimal pieces"
    },
    {
      name: "Marcus",
      image: "/linus face.jpg",
      specialty: "Traditional styles, bold colors"
    },
    {
      name: "Jones",
      image: "/lewis.jpg",
      specialty: "Geometric patterns, abstract art"
    },
    {
      name: "Varos",
      image: "/location.jpg",
      specialty: "Watercolor, realistic portraits"
    }
  ];

  return (
    <div className="animate-fade-in">
      <Hero />
      {/* Featured Gallery Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-black/20">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Featured Work</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Explore our latest creations and get inspired for your next tattoo
            </p>
          </div>
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {galleryImages.map((image, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-300 transform hover:scale-105">
                <Image
                  src={image}
                  alt={`Tattoo ${index + 1}`}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/gallery"
              className="inline-block rounded-lg border border-white/20 px-6 py-3 text-sm hover:bg-white/5 text-white/90 transition-colors duration-300"
            >
              View Full Gallery →
            </Link>
          </div>
        </Container>
      </section>

      {/* Meet Our Artists Section */}
      <section className="py-20">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Meet Our Artists</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Talented artists ready to bring your vision to life
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {artists.map((artist, index) => (
              <div key={index} className="group rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={artist.image}
                    alt={artist.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">{artist.name}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{artist.specialty}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/artists"
              className="inline-block rounded-lg border border-white/20 px-6 py-3 text-sm hover:bg-white/5 text-white/90 transition-colors duration-300"
            >
              Meet All Artists →
            </Link>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black/20 to-transparent">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Why Choose Us</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Experience the difference with our commitment to quality and artistry
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm transform hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors duration-300">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-white text-xl font-semibold mb-4">Custom Work</h3>
              <p className="text-white/70 leading-relaxed">
                From fine line to bold pieces—crafted around your story and style. Every tattoo is a unique expression of your personality.
              </p>
            </div>
            <div className="group rounded-xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm transform hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors duration-300">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-white text-xl font-semibold mb-4">Clean & Safe</h3>
              <p className="text-white/70 leading-relaxed">
                Single-use needles and hospital-grade sterilization, always. Your safety and health are our top priorities.
              </p>
            </div>
            <div className="group rounded-xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm transform hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors duration-300">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-white text-xl font-semibold mb-4">Easy Booking</h3>
              <p className="text-white/70 leading-relaxed">
                Quick consultation request. We reply with times and pricing. Seamless booking process from start to finish.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-black/50 to-transparent">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Ready to Get Inked?</h2>
            <p className="text-white/70 text-lg mb-10 leading-relaxed">
              Transform your vision into reality. Book your consultation today and start your tattoo journey with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/booking"
                className="group relative rounded-lg bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Book Now
                <span className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              </Link>
              <Link
                href="/contact"
                className="rounded-lg border-2 border-white/30 px-8 py-4 text-lg font-semibold hover:bg-white/10 hover:border-white/50 text-white/90 transition-all duration-300 backdrop-blur-sm"
              >
                Contact Us
              </Link>
            </div>
            <div className="mt-10 flex justify-center space-x-6">
              <a href={STUDIO.instagram} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors duration-300">
                <span className="text-2xl">📷</span>
              </a>
              <a href={STUDIO.facebook} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors duration-300">
                <span className="text-2xl">📘</span>
              </a>
              <a href={STUDIO.snapchat} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors duration-300">
                <span className="text-2xl">👻</span>
              </a>
              <a href={STUDIO.twitter} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors duration-300">
                <span className="text-2xl">🐦</span>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
