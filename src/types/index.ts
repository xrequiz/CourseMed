import type { User, Course, Lesson, ChatMessage } from "@prisma/client";

export type { User, Course, Lesson, ChatMessage };

export type CourseWithModules = Course & {
  modules: (import("@prisma/client").Module & {
    lessons: Lesson[];
  })[];
  _count: { enrollments: number };
};

export type ChatMessageWithRole = Pick<ChatMessage, "role" | "content">;
