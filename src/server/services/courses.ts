import { db } from "@/lib/db";
import { getCourse, listCourses } from "@/lib/courses";

export function listCourseSummaries() {
  return listCourses();
}

export function getCourseBySlug(slug: string) {
  return getCourse(slug);
}

/** Spawn a lecture in the user's library from a course's curated outline. */
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
