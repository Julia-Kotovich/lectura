import { db } from "@/lib/db";
import type { ShareRole } from "@prisma/client";

const ROLE_RANK: Record<ShareRole, number> = {
  VIEWER: 1,
  EDITOR: 2,
};

export async function canAccessLecture(
  userId: string,
  lectureId: string,
  minRole: ShareRole = "VIEWER",
) {
  const lecture = await db.lecture.findUnique({
    where: { id: lectureId },
    include: { shares: { where: { userId } } },
  });
  if (!lecture) return null;
  if (lecture.userId === userId) return lecture;

  const share = lecture.shares[0];
  if (share && ROLE_RANK[share.role] >= ROLE_RANK[minRole]) {
    return lecture;
  }
  return null;
}

export async function listAccessibleLectures(userId: string) {
  const owned = await db.lecture.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { slides: true } } },
  });

  const shared = await db.lecture.findMany({
    where: { shares: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { slides: true } }, user: { select: { name: true, email: true } } },
  });

  return { owned, shared };
}
