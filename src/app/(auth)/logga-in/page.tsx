import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "Logga in — Next Act",
  description:
    "Logga in p\u00e5 Next Act f\u00f6r att forts\u00e4tta din mentala tr\u00e4ning.",
};

export default function LoginPage() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-navy">
          V\u00e4lkommen tillbaka
        </h1>
        <p className="mt-2 text-charcoal">
          Logga in f\u00f6r att forts\u00e4tta din tr\u00e4ning
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
