import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Test: import auth but don't call it
  // Just checking if the import itself causes the error
  const hasAuth = typeof auth === "function";
  return (
    <div>
      <p>Test: Auth import works: {hasAuth ? "yes" : "no"}</p>
      {children}
    </div>
  );
}
