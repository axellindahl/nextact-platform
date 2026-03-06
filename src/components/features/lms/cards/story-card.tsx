// Server component (no interactivity needed)
type StoryCardProps = { content: string };

export function StoryCard({ content }: StoryCardProps) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <blockquote className="max-w-prose border-l-4 border-blue-600 pl-6">
        <p className="font-source-sans text-lg italic leading-relaxed text-gray-700">
          {content}
        </p>
      </blockquote>
    </div>
  );
}
