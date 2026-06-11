import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="text-primary">Course</span>Med
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
            Courses
          </Link>
          {session && (
            <Link href="/chat" className="text-muted-foreground hover:text-foreground transition-colors">
              AI Tutor
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <Button variant="ghost" size="sm" type="submit">Sign out</Button>
            </form>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Get started</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
