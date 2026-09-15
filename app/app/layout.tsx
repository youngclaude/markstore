import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Get session - auth() now returns null on error instead of throwing
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/signin");
  }
  
  return <>{children}</>;
}
