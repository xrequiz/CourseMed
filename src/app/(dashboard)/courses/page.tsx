import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CoursesPage() {
  const courses = await db.course.findMany({
    where: { published: true },
    include: { _count: { select: { enrollments: true } }, modules: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Courses</h1>
      {courses.length === 0 ? (
        <p className="text-muted-foreground">No courses published yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {course.specialty}
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {course.modules.length} modules · {course._count.enrollments} enrolled
                </span>
                <Button asChild size="sm">
                  <Link href={`/courses/${course.id}`}>View</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
