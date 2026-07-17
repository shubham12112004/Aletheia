import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Adds support for GitHub Flavored Markdown (tables, checklists, etc.)

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
            <h1 className="mb-4 mt-0 text-2xl font-black text-white border-b border-white/10 pb-2">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-lg font-black text-zinc-100 border-b border-white/5 pb-1">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-base font-bold text-zinc-200">
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className="mb-3 text-sm leading-7 text-zinc-300 font-normal">
              {children}
            </p>
          ),

          ul: ({ children }) => (
            <ul className="mb-4 list-disc pl-6 text-sm text-zinc-300 space-y-1 font-normal">
              {children}
            </ul>
          ),

          li: ({ children }) => (
            <li className="mb-1 text-zinc-300">
              {children}
            </li>
          ),

          table: ({ children }) => (
            <div className="overflow-auto rounded-xl border border-white/10 my-4 bg-zinc-950/40">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),

          th: ({ children }) => (
            <th className="border border-white/10 bg-white/5 p-3 text-left font-bold text-zinc-100">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border border-white/10 p-3 text-zinc-300 font-normal">
              {children}
            </td>
          ),

          strong: ({ children }) => (
            <strong className="font-extrabold text-white">
              {children}
            </strong>
          ),

          code: ({ children }) => (
            <code className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-xs text-emerald-400 font-semibold border border-white/5">
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
