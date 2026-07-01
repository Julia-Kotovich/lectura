import { router } from "./trpc";
import { lectureRouter } from "./routers/lecture";
import { outlineRouter } from "./routers/outline";
import { slidesRouter } from "./routers/slides";
import { evaluationRouter } from "./routers/evaluation";
import { aiRouter } from "./routers/ai";
import { exportRouter } from "./routers/export";
import { shareRouter } from "./routers/share";
import { commentsRouter } from "./routers/comments";
import { templatesRouter } from "./routers/templates";
import { versionsRouter } from "./routers/versions";
import { coursesRouter } from "./routers/courses";

export const appRouter = router({
  lecture: lectureRouter,
  outline: outlineRouter,
  slides: slidesRouter,
  evaluation: evaluationRouter,
  ai: aiRouter,
  export: exportRouter,
  share: shareRouter,
  comments: commentsRouter,
  templates: templatesRouter,
  courses: coursesRouter,
  versions: versionsRouter,
});

export type AppRouter = typeof appRouter;
