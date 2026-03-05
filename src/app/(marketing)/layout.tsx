import { MarketingHeader } from "@/components/layouts/marketing-header";
import { MarketingFooter } from "@/components/layouts/marketing-footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader />
      <main className="pt-[72px]">{children}</main>
      <MarketingFooter />
    </>
  );
}
