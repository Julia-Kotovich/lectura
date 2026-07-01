import Link from "next/link";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
  const authDisabled = process.env.AUTH_DISABLED === "true";

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 text-center">
        <h1 className="text-2xl font-semibold">Sign in to Lectura</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {authDisabled
            ? "Auth is disabled in development. Use the app directly."
            : "Sign in with your university Google account"}
        </p>
        {authDisabled ? (
          <Link
            href="/"
            className="mt-6 inline-flex h-10 items-center rounded-lg bg-violet-600 px-4 text-sm text-white"
          >
            Continue as guest
          </Link>
        ) : (
          <form
            className="mt-6"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <Button type="submit" className="w-full">
              Sign in with Google
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
