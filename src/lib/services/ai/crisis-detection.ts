const CRISIS_KEYWORDS_SV = [
  "ta mitt liv",
  "vill dö",
  "självmord",
  "inte vill leva",
  "skada mig själv",
  "hopplöst",
  "ingen idé",
  "sista utvägen",
  "vill inte finnas",
  "orkar inte mer",
];

const CRISIS_KEYWORDS_EN = [
  "kill myself",
  "want to die",
  "suicide",
  "end my life",
  "self harm",
  "self-harm",
  "no reason to live",
];

const ALL_KEYWORDS = [...CRISIS_KEYWORDS_SV, ...CRISIS_KEYWORDS_EN];

export function detectCrisis(message: string): boolean {
  const lower = message.toLowerCase();
  return ALL_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export const CRISIS_RESPONSE_SV = `Jag hör att du har det tufft just nu, och det du känner är viktigt.

Det här är något som en utbildad person kan hjälpa dig med bättre än jag.

**Ring eller skriv till:**
- **Mind Självmordslinjen:** 90101 (dygnet runt)
- **BRIS (under 18 år):** 116 111
- **1177 Vårdguiden** för allmän hälsorådgivning

Du kan också prata med en vuxen du litar på — en tränare, förälder eller vän.

Jag finns här om du vill fortsätta prata om andra saker.`;
