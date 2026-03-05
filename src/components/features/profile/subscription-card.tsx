"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SubscriptionCardProps = {
  tier: string;
};

const TIER_INFO: Record<
  string,
  { label: string; price: string; description: string }
> = {
  free: {
    label: "Gratis",
    price: "0 kr/mån",
    description: "Begränsad tillgång till innehåll och AI-coach",
  },
  standard: {
    label: "Standard",
    price: "799 kr/år",
    description: "Full tillgång till alla moduler och AI-coaching",
  },
  premium: {
    label: "Premium",
    price: "2 499 kr/år",
    description: "Allt i Standard plus personlig uppföljning",
  },
};

export function SubscriptionCard({ tier }: SubscriptionCardProps) {
  const info = TIER_INFO[tier] ?? TIER_INFO.free;

  async function handleManage() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    if (res.ok) {
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    }
  }

  return (
    <Card shadow>
      <h2 className="mb-4 font-heading text-lg font-semibold text-navy">
        Prenumeration
      </h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-heading text-base font-semibold text-primary">
            {info.label}
          </p>
          <p className="text-sm text-charcoal/60">{info.description}</p>
          <p className="mt-1 text-xs text-charcoal/40">{info.price}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleManage}>
          Hantera
        </Button>
      </div>
    </Card>
  );
}
