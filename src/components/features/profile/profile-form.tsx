"use client";

import { useTransition, useState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProfileFormProps = {
  initialName: string;
  initialSport: string;
  initialLanguage: string;
};

export function ProfileForm({
  initialName,
  initialSport,
  initialLanguage,
}: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(initialName);
  const [sport, setSport] = useState(initialSport);
  const [language, setLanguage] = useState(initialLanguage);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateProfile({ displayName: name, sport });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="profile-name"
          className="mb-1 block text-sm font-medium text-charcoal"
        >
          Namn
        </label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ditt namn"
        />
      </div>

      <div>
        <label
          htmlFor="profile-sport"
          className="mb-1 block text-sm font-medium text-charcoal"
        >
          Idrott
        </label>
        <Input
          id="profile-sport"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          placeholder="t.ex. Fotboll"
        />
      </div>

      <div>
        <label
          htmlFor="profile-language"
          className="mb-1 block text-sm font-medium text-charcoal"
        >
          Språk
        </label>
        <select
          id="profile-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded-xl border border-light-gray/50 bg-off-white px-4 py-3 text-charcoal focus:border-primary focus:outline-none"
        >
          <option value="sv">Svenska</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sparar..." : "Spara"}
        </Button>
        {saved && <span className="text-sm text-success">Sparat!</span>}
      </div>
    </form>
  );
}
