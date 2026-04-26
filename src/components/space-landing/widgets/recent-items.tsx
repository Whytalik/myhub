import Link from "next/link";

interface RecentItem {
  title: string;
  subtitle?: string;
  href: string;
  date?: string;
}

interface RecentItemsProps {
  title: string;
  items: RecentItem[];
  emptyMessage?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function RecentItems({ title, items, emptyMessage = "No items yet", actionLabel, actionHref }: RecentItemsProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 mb-12">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">{title}</h4>
        {actionLabel && actionHref && (
          <Link href={actionHref} className="text-[10px] font-mono text-muted hover:text-text transition-colors uppercase tracking-[0.2em]">
            {actionLabel} →
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-secondary text-center py-6">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center justify-between p-3 rounded-lg bg-bg/40 hover:bg-raised transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-text group-hover:text-accent transition-colors">{item.title}</p>
                {item.subtitle && <p className="text-[10px] text-secondary mt-0.5">{item.subtitle}</p>}
              </div>
              {item.date && <span className="text-[10px] font-mono text-muted">{item.date}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
