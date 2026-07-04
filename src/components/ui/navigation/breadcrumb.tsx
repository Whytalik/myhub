import Link from "next/link";

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div >
      <Link href="/" >hub</Link>
      {items.map((item, index) => (
        <span key={index} >
          <span >/</span>
          {item.href ? (
            <Link href={item.href} >
              {item.label}
            </Link>
          ) : (
            <span >{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
