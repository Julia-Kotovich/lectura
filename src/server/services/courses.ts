import { db } from "@/lib/db";
import { getCourse, listCourses } from "@/lib/curriculum";

export function listCourseSummaries() {
  return listCourses();
}

export function getCourseBySlug(slug: string) {
  return getCourse(slug);
}

/** Spawn a user Lecture from a catalog course lecture outline. */
export async function createLectureFromCourseEntry(
  userId: string,
  courseSlug: string,
  lectureSlug: string,
) {
  const course = getCourse(courseSlug);
  if (!course) throw new Error("Course not found");

  const entry = course.lectures.find((l) => l.slug === lectureSlug);
  if (!entry) throw new Error("Lecture not found in course");

  const lecture = await db.lecture.create({
    data: {
      userId,
      title: `${course.title} — ${entry.title}`,
      description: entry.summary,
      status: "OUTLINE_READY",
    },
  });

  await db.outlineVersion.create({
    data: {
      lectureId: lecture.id,
      version: 1,
      content: entry.outline,
      isActive: true,
    },
  });

  return lecture;
}
