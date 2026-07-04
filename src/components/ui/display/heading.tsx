interface HeadingProps {
  title: string;
  className?: string;
}

export function Heading({ title, className = "text-heading md:text-title" }: HeadingProps) {
  return (
    <div >
      <h1 >
        {title}
      </h1>
    </div>
  );
}
