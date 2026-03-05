export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-heading text-4xl font-bold">404</h1>
      <p className="mt-4 text-lg text-charcoal">Sidan kunde inte hittas.</p>
      <a href="/" className="mt-6 text-primary hover:text-primary-hover">
        Tillbaka till startsidan
      </a>
    </div>
  );
}
