import Link from "next/link";
import { GraduationCap, Plus, BookOpen, Layers } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <GraduationCap className="h-5 w-5 text-violet-600" />
            Lectura
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/programs"
              className="inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Layers className="h-4 w-4" />
              Programs
            </Link>
            <Link
              href="/courses"
              className="inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <BookOpen className="h-4 w-4" />
              Courses
            </Link>
            <Link
              href="/lectures/new"
              className="inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              New
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
