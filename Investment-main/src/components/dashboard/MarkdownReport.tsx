import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Adds support for GitHub Flavored Markdown (tables, checklists, etc.)

export function MarkdownReport({
  markdown,
}: {
  markdown: string;
}) {
  return (
    <article className="prose prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // Binds the GFM plugin to parse tables correctly
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-0 text-3xl font-black text-slate-950">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-xl font-black text-slate-950">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-lg font-bold text-slate-800">
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className="mb-3 leading-7 text-slate-700">
              {children}
            </p>
          ),

          ul: ({ children }) => (
            <ul className="mb-4 list-disc pl-6 text-slate-700">
              {children}
            </ul>
          ),

          li: ({ children }) => (
            <li className="mb-1">
              {children}
            </li>
          ),

          table: ({ children }) => (
            <div className="overflow-auto rounded-lg border my-4">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),

          th: ({ children }) => (
            <th className="border bg-slate-100 p-2 text-left font-bold text-slate-900">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border p-2 text-slate-700">
              {children}
            </td>
          ),

          strong: ({ children }) => (
            <strong className="font-bold text-slate-900">
              {children}
            </strong>
          ),

          code: ({ children }) => (
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-sm text-slate-900">
              {children}
            </code>
          ),

          a: ({ children, href }) => (
            <a
              href={href || '#'}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
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
