import Container from "@/components/Container";

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "Use our online booking form to request a consultation. We'll review your request and reply via email within 24 hours with available dates, pricing, and next steps. Deposits are required to secure your appointment.",
      icon: "📅"
    },
    {
      question: "What's the minimum age for getting a tattoo?",
      answer: "You must be 18 years or older with valid government-issued ID. We do not tattoo minors under any circumstances. If you&apos;re under 18, please come back when you&apos;re of legal age.",
      icon: "🎂"
    },
    {
      question: "How should I prepare for my tattoo session?",
      answer: "Proper preparation ensures a better experience. Here's what to do:",
      list: [
        "Eat a good meal 1-2 hours before your appointment",
        "Stay well-hydrated with water",
        "Avoid alcohol and recreational drugs for 24 hours prior",
        "Wear comfortable, loose-fitting clothing",
        "Moisturize the area to be tattooed",
        "Get a good night's sleep"
      ],
      icon: "💪"
    },
    {
      question: "How much do tattoos cost?",
      answer: "Pricing depends on size, complexity, and placement. Small tattoos start at $20, while larger pieces can range from $200-$1000+. We'll provide a detailed quote during your consultation. A $25 deposit is required to book.",
      icon: "💰"
    },
    {
      question: "How long does a tattoo session take?",
      answer: "Session length varies by tattoo size and complexity. Small tattoos (2-4 inches) typically take 1-2 hours, while larger pieces may require multiple sessions over several hours or days. We'll discuss timing during your consultation.",
      icon: "⏰"
    },
    {
      question: "Is the studio clean and safe?",
      answer: "Absolutely. We maintain the highest standards of cleanliness and sterilization. All equipment is autoclaved, we use single-use needles, and the studio is regularly disinfected. Our artists are licensed and follow all health and safety protocols.",
      icon: "🛡️"
    },
    {
      question: "What if I have medical conditions or allergies?",
      answer: "Please disclose any medical conditions, allergies, or medications during your consultation. Certain conditions may affect your eligibility or require special precautions. We're happy to work with your healthcare provider if needed.",
      icon: "🏥"
    },
    {
      question: "Can I bring someone with me?",
      answer: "Yes! We encourage you to bring a friend or family member for support. However, space is limited, so please let us know in advance if you'll have someone accompanying you.",
      icon: "👥"
    },
    {
      question: "What forms of payment do you accept?",
      answer: "We accept cash, card payments, and mobile money through our secure payment system. Deposits can be paid online, and remaining balance is due at the end of your session.",
      icon: "💳"
    },
    {
      question: "What if I need to reschedule or cancel?",
      answer: "We understand plans change. Please give us at least 48 hours notice for rescheduling. Deposits are non-refundable for cancellations within 24 hours, but can be applied to a future appointment.",
      icon: "🔄"
    },
    {
      question: "Do you offer custom designs?",
      answer: "Yes! We specialize in custom work. Bring reference images, sketches, or descriptions of what you have in mind. We'll collaborate to create something unique that fits your vision and style.",
      icon: "🎨"
    }
  ];

  return (
    <div className="py-20 animate-fade-in">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-4 animate-slide-up">Frequently Asked Questions</h1>
            <p className="text-white/70 text-lg animate-slide-up animation-delay-200">
              Everything you need to know about getting inked with us
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="group rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm animate-slide-up" style={{ animationDelay: `${400 + index * 100}ms` }}>
                <div className="flex items-start space-x-4">
                  <span className="text-3xl flex-shrink-0 mt-1">{faq.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-xl mb-3">{faq.question}</h3>
                    <p className="text-white/80 leading-relaxed mb-3">
                      {faq.answer}
                    </p>
                    {faq.list && (
                      <ul className="text-white/80 text-sm space-y-2 list-disc list-inside ml-4">
                        {faq.list.map((item, listIndex) => (
                          <li key={listIndex}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 animate-slide-up animation-delay-1000">
            <p className="text-white/60 text-lg">
              Still have questions? Feel free to contact us directly—we're here to help!
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

