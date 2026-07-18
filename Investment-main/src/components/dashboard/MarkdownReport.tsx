import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Adds support for GitHub Flavored Markdown (tables, checklists, etc.)
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, ShieldCheck, Activity } from "lucide-react";

export function MarkdownReport({
  markdown,
}: {
  markdown: string;
}) {
  return (
    <article className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // Binds the GFM plugin to parse tables correctly
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 mt-0 text-3xl font-bold tracking-tight text-foreground border-b border-border/40 pb-4">
              {children}
            </h1>
          ),

          h2: ({ children }) => {
            const text = String(children);
            let Icon = null;
            let colorClass = "text-foreground";
            
            if (text.includes("Bull Case") || text.includes("Positive")) {
              Icon = TrendingUp;
              colorClass = "text-emerald-500";
            } else if (text.includes("Bear Case") || text.includes("Risk")) {
              Icon = TrendingDown;
              colorClass = "text-rose-500";
            } else if (text.includes("Confidence")) {
              Icon = Target;
              colorClass = "text-blue-500";
            } else if (text.includes("Recommendation")) {
              Icon = Lightbulb;
              colorClass = "text-amber-500";
            } else if (text.includes("Metrics")) {
              Icon = Activity;
            }

            return (
              <h2 className={`mb-4 mt-8 flex items-center gap-2 text-xl font-bold tracking-tight border-b border-border/20 pb-2 ${colorClass}`}>
                {Icon && <Icon className="h-5 w-5" />}
                {children}
              </h2>
            );
          },

          h3: ({ children }) => (
            <h3 className="mb-3 mt-6 text-lg font-semibold text-foreground/90 tracking-tight">
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className="mb-4 text-base leading-relaxed text-muted-foreground font-normal">
              {children}
            </p>
          ),

          ul: ({ children }) => (
            <ul className="mb-6 list-disc pl-6 text-base text-muted-foreground space-y-2 font-normal">
              {children}
            </ul>
          ),

          li: ({ children }) => (
            <li className="text-muted-foreground">
              {children}
            </li>
          ),

          table: ({ children }) => (
            <div className="overflow-auto rounded-xl border border-border bg-card/50 my-6 shadow-sm">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),

          th: ({ children }) => (
            <th className="border-b border-border/50 bg-muted/50 p-4 text-left font-semibold text-foreground">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border-b border-border/30 p-4 text-muted-foreground font-normal last:border-0">
              {children}
            </td>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),

          code: ({ children }) => (
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] text-primary font-medium border border-border/50">
              {children}
            </code>
          ),

          a: ({ children, href }) => (
            <a
              href={href || '#'}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-400 underline decoration-emerald-500/30 underline-offset-4 hover:text-emerald-300"
            >
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
