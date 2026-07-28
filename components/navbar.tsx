import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav>
      <Link href="/">GameDex</Link>
      <Link href="/games">Catalog</Link>

      <Show when="signed-in">
        <Link href="/library">Biblioteca mea</Link>
        <Link href="/profile">Profil</Link>
        <Link href="/recommendations">Recomandari</Link>
        <Link href="/friends">Prieteni</Link>
        <UserButton />
      </Show>

      <Show when="signed-out">
        <SignInButton />
        <SignUpButton />
      </Show>
    </nav>
  );
}
