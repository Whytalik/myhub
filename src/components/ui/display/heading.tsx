interface HeadingProps {
  title: string;
  className?: string;
}

export function Heading({ title, className = "" }: HeadingProps) {
  const headingClass = `text-page-title ${className}`;

  return (
    <div>
      <h1 className={headingClass}>{title}</h1>
    </div>
  );
}
