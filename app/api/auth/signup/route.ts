import { createUser, findUserByEmail } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { resolveAuthSecret } from "@/lib/auth-secret";

export async function POST(request: Request) {
  try {
    resolveAuthSecret();
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      confirmPassword?: string;
      planToStore?: string;
    };

    const email = String(body.email ?? "")
      .toLowerCase()
      .trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");
    const planToStore = String(body.planToStore ?? "").trim() || null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return Response.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return Response.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    await createUser({ email, passwordHash, planToStore });

    return Response.json({ ok: true, email });
  } catch (err) {
    console.error("signup error", err);
    return Response.json({ error: "Could not create account." }, { status: 500 });
  }
}
