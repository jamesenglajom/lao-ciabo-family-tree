export function SectionHeading({ eyebrow, title, description, align = "left" }) {
  const alignment = align === "center" ? "text-center items-center mx-auto" : "text-left items-start";

  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignment}`}>
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {description ? (
        <p className="text-balance text-base leading-relaxed text-ink-soft">{description}</p>
      ) : null}
    </div>
  );
}
