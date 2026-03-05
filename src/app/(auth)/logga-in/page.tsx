import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "Logga in — Next Act",
  description:
    "Logga in på Next Act för att fortsätta din mentala träning.",
};

export default function LoginPage() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-navy">
          Välkommen tillbaka
        </h1>
        <p className="mt-2 text-charcoal">
          Logga in för att fortsätta din träning
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-charcoal">
        Har du inget konto?{" "}
        <Link
          href="/registrera"
          className="font-medium text-primary hover:text-primary-hover"
        >
          Skapa konto
        </Link>
      </p>
    </div>
  );
}
