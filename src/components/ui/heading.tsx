interface HeadingProps {
  title: string;
  className?: string;
}

export function Heading({ title, className = "text-5xl" }: HeadingProps) {
  return (
    <div className="mb-4">
      <h1 className={`${className} font-heading text-text leading-none tracking-tight`}>
        {title}
      </h1>
      <div className="mt-4 h-[2px] w-16 bg-accent" />
    </div>
  );
}
