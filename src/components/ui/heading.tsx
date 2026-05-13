interface HeadingProps {
  title: string;
  className?: string;
}

export function Heading({ title, className = "text-heading md:text-title" }: HeadingProps) {
  return (
    <div className="mb-2">
      <h1 className={`${className} font-heading text-text-primary leading-tight`}>
        {title}
      </h1>
    </div>
  );
}
