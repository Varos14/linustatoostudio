import Container from "@/components/Container";

export default function AftercarePage() {
  return (
    <div className="py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl text-white mb-8">Tattoo Aftercare Guide</h1>

          <div className="bg-white/5 rounded-lg p-6 mb-8">
            <h2 className="font-serif text-2xl text-white mb-4">Why Proper Aftercare Matters</h2>
            <p className="text-white/80 leading-relaxed">
              Proper tattoo aftercare is crucial for healing, preventing infection, and ensuring your tattoo looks vibrant for years to come.
              Follow these guidelines carefully to achieve the best results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="font-serif text-xl text-white mb-4">First 24-48 Hours</h3>
              <ol className="space-y-3 text-white/80 text-sm list-decimal list-inside">
                <li>Keep the bandage on for 2-4 hours as instructed by your artist.</li>
                <li>After removing, gently wash with lukewarm water and unscented, antibacterial soap.</li>
                <li>Pat dry with a clean paper towel—never rub.</li>
                <li>Apply a thin layer of fragrance-free moisturizer or healing ointment.</li>
                <li>Keep covered with a clean bandage if needed.</li>
              </ol>
            </div>

            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="font-serif text-xl text-white mb-4">Days 3-14: Healing Phase</h3>
              <ul className="space-y-3 text-white/80 text-sm list-disc list-inside">
                <li>Continue washing gently 2-3 times daily.</li>
                <li>Apply moisturizer 2-3 times daily to keep skin hydrated.</li>
                <li>Scabs may form—do not pick or scratch them.</li>
                <li>Avoid submerging in water (pools, baths, hot tubs).</li>
                <li>Stay out of saunas and avoid excessive sweating.</li>
              </ul>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-6 mb-8">
            <h3 className="font-serif text-xl text-white mb-4">What to Avoid</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Activities</h4>
                <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
                  <li>Direct sun exposure for 2 weeks</li>
                  <li>Scratching or picking scabs</li>
                  <li>Swimming or soaking in water</li>
                  <li>Heavy exercise causing excessive sweat</li>
                  <li>Tight clothing over the tattoo</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Products</h4>
                <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
                  <li>Fragranced lotions or soaps</li>
                  <li>Alcohol-based products</li>
                  <li>Petroleum jelly (can trap bacteria)</li>
                  <li>Makeup or cosmetics</li>
                  <li>Chlorine or saltwater</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-6 mb-8">
            <h3 className="font-serif text-xl text-white mb-4">Long-Term Care</h3>
            <ul className="space-y-3 text-white/80 text-sm list-disc list-inside">
              <li>Use SPF 30+ sunscreen daily once fully healed to prevent fading.</li>
              <li>Keep skin moisturized to maintain tattoo vibrancy.</li>
              <li>Avoid laser treatments or chemical peels over the tattoo.</li>
              <li>Regular touch-ups may be needed as tattoos fade over time.</li>
            </ul>
          </div>

          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
            <h3 className="font-serif text-xl text-red-400 mb-4">Warning Signs</h3>
            <p className="text-white/80 mb-3">
              Contact your tattoo artist or healthcare provider immediately if you notice:
            </p>
            <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
              <li>Excessive redness, swelling, or warmth</li>
              <li>Pus, oozing, or foul odor</li>
              <li>Fever or chills</li>
              <li>Increasing pain after the first few days</li>
              <li>Rash or allergic reaction</li>
            </ul>
          </div>

          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">
              Remember, every tattoo heals differently. If you have concerns, don&apos;t hesitate to reach out to your artist.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

