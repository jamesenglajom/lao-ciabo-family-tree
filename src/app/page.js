import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { GlassPanel } from "@/components/ui/glass-panel";
import { BirthdayTile } from "@/components/home/birthday-tile";
import { YoungMembersTile } from "@/components/home/young-members-tile";
import { AnnouncementsTile } from "@/components/home/announcements-tile";
import { getHomeData } from "@/lib/home-data";
import { getSiteSettings } from "@/lib/site-settings";

function AvatarCluster({ members, size = 56 }) {
  return (
    <div className="flex -space-x-5">
      {members.map((member, index) => (
        <Image
          key={member.id}
          src={member.avatar}
          alt={member.full_name}
          width={size}
          height={size}
          unoptimized
          className="rounded-full border-2 border-canvas object-cover object-center shadow-lg"
          style={{
            width: size,
            height: size,
            transform: `translateY(${index % 2 === 0 ? "0px" : "8px"}) rotate(${
              (index - 3) * 3
            }deg)`,
            zIndex: members.length - index,
          }}
        />
      ))}
    </div>
  );
}

export default async function Home() {
  const [
    { stats, birthdayCelebrants, youngMembers, announcements, spotlightMembers },
    settings,
  ] = await Promise.all([getHomeData(), getSiteSettings()]);

  const STATS = [
    { label: "Generations", value: stats.generations },
    { label: "Founding members", value: stats.foundingMembers },
    { label: "Family members", value: stats.totalMembers },
    { label: "Living members", value: stats.livingMembers },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <Container className="flex flex-col items-start gap-8">
          <span className="rounded-full border border-line bg-panel/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
            {settings.heroEyebrow}
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
            {settings.siteNameParts.before}
            {settings.siteNameParts.accent ? (
              <span className="text-accent">{settings.siteNameParts.accent}</span>
            ) : null}
            {settings.siteNameParts.after}
          </h1>
          {settings.familyLines.length > 0 ? (
            <ul aria-label="Family lines" className="flex flex-wrap gap-2">
              {settings.familyLines.map((line) => (
                <li
                  key={line}
                  className="rounded-full border border-line bg-panel/70 px-3.5 py-1 text-sm font-semibold text-accent-2"
                >
                  {line}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="max-w-xl text-lg leading-relaxed text-ink-soft">{settings.tagline}</p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/family-tree"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-transform hover:scale-[1.03]"
            >
              Explore the family tree
            </Link>
          </div>

          {spotlightMembers.length > 0 ? (
            <div className="pt-6">
              <AvatarCluster members={spotlightMembers} />
            </div>
          ) : null}
        </Container>
      </section>

      {/* Bento grid */}
      <section className="pb-24">
        <Container>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[minmax(190px,auto)] lg:grid-cols-4">
            {/* Feature tile */}
            <GlassPanel className="flex flex-col justify-between gap-6 p-8 sm:col-span-2 lg:col-span-2 lg:row-span-2">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent-2">
                  family-chart &middot; D3.js
                </span>
                <h3 className="text-2xl font-semibold tracking-tight text-ink">
                  See the whole tree, beautifully rendered
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">
                  A smooth, interactive chart that recenters on any person you click, with a
                  searchable picker to jump straight to a name.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Recenter on click", "Searchable", "MIT licensed"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/family-tree"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas transition-transform hover:scale-[1.03]"
              >
                Open the family tree
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </GlassPanel>

            {/* Stat tiles */}
            {STATS.map((stat) => (
              <GlassPanel key={stat.label} className="flex flex-col justify-center gap-1 p-6">
                <span className="text-4xl font-semibold tracking-tight text-ink">
                  {stat.value}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                  {stat.label}
                </span>
              </GlassPanel>
            ))}

            {/* Live data tiles */}
            <BirthdayTile members={birthdayCelebrants} />
            <YoungMembersTile
              members={youngMembers}
              title={settings.youngTitle}
              maxAge={settings.youngMaxAge}
            />
            <AnnouncementsTile
              title={settings.announcementsTitle}
              announcements={announcements}
              className="sm:col-span-2 lg:col-span-2"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
