import Container from "@/components/Container";
import { STUDIO } from "@/lib/config";
import Image from "next/image";

export default function GalleryPage() {
  const galleryImages = [
    "/WhatsApp Image 2025-10-07 at 12.55.41_71efb83d.jpg",
    "/neck tatoo.jpg",
    "/chest tatoo.jpg",
    "/waist tatoo.jpg",
    "/hand tatoo.jpg",
    "/2 hand.jpg",
    "/linus face.jpg",
    "/lewis.jpg",
    "/location.jpg"
  ];

  return (
    <div className="py-20 animate-fade-in">
      <Container>
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4 animate-slide-up">Gallery</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto animate-slide-up animation-delay-200">
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
      </Container>
    </div>
  );
}

