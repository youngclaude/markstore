import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { createProject, listProjects } from "@/lib/projects";
import {
  getUserBilling,
  getEffectivePlan,
  getProjectCount,
  canCreateProject,
  PLAN_LIMITS,
} from "@/lib/billing";

export async function GET() {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await listProjects(session.user.id);
    return Response.json({ projects });
  } catch (err) {
    console.error("list projects error", err);
    return Response.json({ error: "Could not list projects." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const userBilling = await getUserBilling(userId);
    const plan = userBilling ? getEffectivePlan(userBilling) : "free";
    const projectCount = await getProjectCount(userId);

    if (!canCreateProject(plan, projectCount)) {
      const limit = PLAN_LIMITS[plan].projects;
      return Response.json(
        {
          error: `You've reached the limit of ${limit} projects on the ${plan === "free" ? "Free" : "Pro"} plan. ${plan === "free" ? "Upgrade to Pro for up to 50 projects." : ""}`,
          code: "PLAN_LIMIT_EXCEEDED",
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string;
    };

    const name = body.name?.trim();
    if (!name) {
      return Response.json({ error: "Project name is required." }, { status: 400 });
    }

    try {
      const project = await createProject({
        userId,
        name,
        description: body.description,
      });
      return Response.json({ ok: true, project }, { status: 201 });
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return Response.json(
          { error: "A project with that name already exists." },
          { status: 409 },
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("create project error", err);
    return Response.json({ error: "Could not create project." }, { status: 500 });
  }
}
