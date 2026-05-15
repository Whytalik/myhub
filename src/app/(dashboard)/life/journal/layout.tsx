export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-8 py-8">
      {children}
    </div>
  );
}
