"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Hero.module.css";

export default function Hero() {
  const router = useRouter();

  function handleBook(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (typeof window !== "undefined" && (window.location.pathname === "/" || window.location.pathname === "")) {
      const target = document.getElementById("bookings") || document.getElementById("book");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", target.id ? `#${target.id}` : "#bookings");
        return;
      }
    }
    router.push("/booking");
  }

  return (
    <section className={styles.hero} aria-label="Studio hero section">
      <div className={styles.bg} aria-hidden="true">
        <Image
          src="/linus face.jpg"
          alt="linus face- Studio hero"
          fill
          priority
          unoptimized
          className={styles.image}
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>Linus Tattoo Studio</h1>
        <p className={styles.subtitle}>Book an appointment with our artists.</p>

        <div className={styles.cta}>
          <a href="/booking" onClick={handleBook} className={styles.primary}>
            Book Now
          </a>
        </div>
      </div>
    </section>
  );
}