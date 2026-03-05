import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/features/auth/register-form";

export const metadata: Metadata = {
  title: "Skapa konto — Next Act",
  description:
    "Registrera dig på Next Act och börja din mentala träning idag.",
};

export default function RegisterPage() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-navy">
          Skapa konto
        </h1>
        <p className="mt-2 text-charcoal">
          Börja din mentala träningsresa idag
        </p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-charcoal">
        Har du redan ett konto?{" "}
        <Link
          href="/logga-in"
          className="font-medium text-primary hover:text-primary-hover"
        >
          Logga in
        </Link>
      </p>
    </div>
  );
}
