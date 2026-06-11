import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Powered by Claude AI
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Medical education, supercharged by AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Learn medicine at your own pace with interactive courses and an AI tutor available 24/7 to answer your questions.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/courses">Browse courses</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Start for free</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
