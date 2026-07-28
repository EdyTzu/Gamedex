import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>GameDex</h1>
      <p>
        Biblioteca ta personala de jocuri video. Tine evidenta jocurilor jucate,
        da-le note si primeste recomandari pe baza gusturilor tale.
      </p>
      <Link href="/sign-up">Get Started</Link>
    </main>
  );
}