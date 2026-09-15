import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Test: add auth import only to see if it causes the issue
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }
  return (
    <div>
      <p>Test: Auth import works</p>
      {children}
    </div>
  );
}
