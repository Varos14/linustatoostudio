export const STUDIO = {
  name: "Linus Tattoo Studio",
  tagline: "Custom tattoos. Clean lines. Bold stories.",
  city: "Kampala-Uganda",
  address: "Acacia plot 1 bukoto street",
  phone: "0755817178/0770172884",
  email: process.env.NEXT_PUBLIC_STUDIO_EMAIL || "geraldvaros@gmail.com",
  instagram: "https://www.instagram.com/linustats_tattoo_studio/?hl=en",
  facebook: "https://www.facebook.com/linustats_tattoo_studio",
  snapchat: "https://snapchat.com/t/WqqzJc98",
  twitter: "https://twitter.com/linustattoo",
};

export const BOOKING = {
  depositEnabled: process.env.NEXT_PUBLIC_DEPOSIT_ENABLED === "true",
  depositAmountCents: 1000, // $10
  currency: (process.env.NEXT_PUBLIC_CURRENCY || "USD").toUpperCase(),
};

