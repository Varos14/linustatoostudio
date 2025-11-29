import Container from "@/components/Container";
import Image from "next/image";
export default function ArtistsPage() {
  const artists = [
    {
      name: "Linus",
      image: "/WhatsApp Image 2025-10-07 at 12.55.41_71efb83d.jpg",
      specialty: "Specialist in fine line, blackwork, and minimal pieces. Open to custom concepts."
    },
    {
      name: "Marcus",
      image: "/linus face.jpg",
      specialty: "Expert in traditional tattoo styles with a focus on bold colors and intricate designs."
    },
    {
      name: "Jones",
      image: "/lewis.jpg",
      specialty: "Specializes in geometric patterns and abstract art. Known for precise line work."
    },
    {
      name: "Varos",
      image: "/location.jpg",
      specialty: "Master of watercolor techniques and realistic portraits. Brings imagination to life."
    }
  ];

  return (
    <div className="py-20 animate-fade-in">
      <Container>
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4 animate-slide-up">Meet Our Artists</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto animate-slide-up animation-delay-200">
            Talented artists ready to bring your vision to life
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {artists.map((artist, index) => (
            <div key={index} className="group rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm transform hover:scale-105">
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <Image
                  src={artist.image}
                  alt={artist.name}
                  width={400}
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
      </Container>
    </div>
  );
}

