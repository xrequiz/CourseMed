import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const courses = await db.course.findMany({
    where: { published: true },
    include: {
      _count: { select: { enrollments: true } },
      modules: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(courses);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const course = await db.course.create({ data: body });
  return Response.json(course, { status: 201 });
}
