import Link from "next/link";
import { Container } from "@/components/ui/container";

export function SiteFooter({ ownerName }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-canvas-soft">
      <Container className="flex flex-col gap-4 py-10 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {year} {ownerName}. Built with{" "}
          <a
            className="text-ink-soft underline decoration-line underline-offset-4 hover:text-accent"
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </a>
          .
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <Link href="/family-tree" className="hover:text-accent">
            Family Tree
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
