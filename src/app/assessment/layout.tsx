export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1C1C1E] to-[#000000] text-white py-11">
      {children}
    </div>
  );
} 