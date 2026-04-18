import Link from "next/link";

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.2em] mb-6">
      <Link href="/" className="text-muted hover:text-accent transition-colors">hub</Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          <span className="text-muted">/</span>
          {item.href ? (
            <Link href={item.href} className="text-muted hover:text-accent transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-secondary">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
