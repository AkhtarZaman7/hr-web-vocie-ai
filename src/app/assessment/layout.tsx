export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#1C1C1E] to-[#000000] text-white overflow-hidden py-11">
      {children}
    </div>
  );
} 