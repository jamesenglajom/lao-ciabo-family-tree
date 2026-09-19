import dynamic from "next/dynamic";
import { Container } from "@/components/ui/container";
import { TreeSkeleton } from "@/components/family-tree/tree-skeleton";
import { getFamilyChartData } from "@/lib/family-data";

const FamilyChartTree = dynamic(
  () => import("@/components/family-tree/family-chart-tree").then((m) => m.FamilyChartTree),
  { loading: () => <TreeSkeleton /> }
);

export const metadata = {
  title: "Family Tree",
  description:
    "The Lao – Ciabo family tree — a D3-powered interactive chart that recenters on any person.",
  alternates: { canonical: "/family-tree" },
};

export default async function FamilyTreePage() {
  const data = await getFamilyChartData();

  return (
    <Container className="flex flex-col gap-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          The Lao &ndash; Ciabo Family Tree
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          Drag to pan, scroll to zoom, and click any card to make that person the new center of
          the tree. Use the search field to jump straight to a name.
        </p>
      </div>

      <div className="family-chart-shell glass h-[70vh] min-h-130 w-full overflow-hidden rounded-3xl">
        <FamilyChartTree data={data} />
      </div>

      <p className="text-xs text-ink-faint">
        Built with{" "}
        <a
          href="https://github.com/donatso/family-chart"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-line underline-offset-4 hover:text-accent"
        >
          family-chart
        </a>{" "}
        (MIT licensed).
      </p>
    </Container>
  );
}
