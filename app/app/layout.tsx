import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Test: wrap auth() in try-catch
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("[AppLayout] auth() threw:", error);
    // If auth fails, redirect to signin
    redirect("/signin");
  }
  
  if (!session?.user?.id) {
    redirect("/signin");
  }
  
  return (
    <div>
      <p>Test: Auth works, user: {session.user.email}</p>
      {children}
    </div>
  );
}
