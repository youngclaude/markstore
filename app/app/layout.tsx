export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Temporary completely minimal layout to test basic routing
  return (
    <div>
      <p>Test: Layout rendered successfully</p>
      {children}
    </div>
  );
}
