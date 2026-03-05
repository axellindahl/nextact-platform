"use client";

import { useTransition, useState } from "react";
import { deleteAccount } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deleteAccount();
      window.location.href = "/";
    });
  }

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="text-sm text-red-500 hover:text-red-700 hover:underline"
      >
        Radera konto
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">
        Är du säker? Ditt konto och all data kommer att raderas permanent. Denna
        åtgärd kan inte ångras.
      </p>
      <div className="flex gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
        >
          Avbryt
        </Button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
        >
          {isPending ? "Raderar..." : "Ja, radera mitt konto"}
        </button>
      </div>
    </div>
  );
}
