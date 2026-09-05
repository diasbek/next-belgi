import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/cn";

export function LegalMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "legal-prose text-base leading-relaxed text-ink/85",
        "[&_h1]:mb-4 [&_h1]:font-display [&_h1]:text-[clamp(1.5rem,3vw,2rem)] [&_h1]:font-semibold [&_h1]:tracking-[-0.02em] [&_h1]:text-ink",
        "[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink",
        "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink",
        "[&_p]:mb-4 [&_p]:last:mb-0",
        "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
        "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5",
        "[&_li]:leading-relaxed",
        "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-lime [&_blockquote]:bg-[#f8f9f6] [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-sm [&_blockquote]:text-ink-muted",
        "[&_a]:font-medium [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2",
        "[&_strong]:font-semibold [&_strong]:text-ink",
        "[&_hr]:my-8 [&_hr]:border-black/10",
        className,
      )}
    >
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noreferrer" : undefined}>
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
