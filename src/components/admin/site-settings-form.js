"use client";

import { useActionState } from "react";
import { saveSiteSettingsAction } from "@/app/admin/(protected)/config/actions";
import { ImageField } from "@/components/admin/image-field";

const inputClass =
  "rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-ink outline-none focus:border-accent";
const labelClass = "text-sm font-medium text-ink";
const hintClass = "text-xs text-ink-faint";

const initialState = { error: null, success: false };

function Field({ id, label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {hint ? <span className={hintClass}>{hint}</span> : null}
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <fieldset className="flex flex-col gap-4 border-t border-line pt-5 first:border-0 first:pt-0">
      <legend className="sr-only">{title}</legend>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">{title}</h3>
        {description ? <p className="text-xs text-ink-faint">{description}</p> : null}
      </div>
      {children}
    </fieldset>
  );
}

/**
 * `raw` is the stored row (nullable columns), `resolved` the same settings
 * with defaults filled in — a blank field shows its default as a placeholder,
 * so it's clear what the site does if you leave it empty.
 */
export function SiteSettingsForm({ raw, resolved, timeZones }) {
  const [state, formAction, pending] = useActionState(saveSiteSettingsAction, initialState);
  const row = raw ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Section title="Identity" description="Who this site is for. Leave a field blank to use its default.">
        <Field id="family_name" label="Family name" hint="Used in the header, footer and headings, e.g. Lao.">
          <input
            id="family_name"
            name="family_name"
            defaultValue={row.family_name ?? ""}
            placeholder="Lao"
            className={inputClass}
          />
        </Field>

        <Field
          id="family_lines"
          label="Family lines"
          hint="One per line — e.g. each wife's line, written maiden name first: Ciabo-Lao. Shown as badges on the home page. Optional."
        >
          <textarea
            id="family_lines"
            name="family_lines"
            rows={3}
            defaultValue={(row.family_lines ?? []).join("\n")}
            className={inputClass}
          />
        </Field>

        <Field id="site_name" label="Site name" hint="Blank = “The {family name} Family Tree”.">
          <input
            id="site_name"
            name="site_name"
            defaultValue={row.site_name ?? ""}
            placeholder={resolved.siteName}
            className={inputClass}
          />
        </Field>

        <Field id="hero_eyebrow" label="Home page label" hint="The small line above the home page heading.">
          <input
            id="hero_eyebrow"
            name="hero_eyebrow"
            defaultValue={row.hero_eyebrow ?? ""}
            placeholder={resolved.heroEyebrow}
            className={inputClass}
          />
        </Field>

        <Field id="tagline" label="Home page intro" hint="The paragraph under the home page heading.">
          <textarea
            id="tagline"
            name="tagline"
            rows={3}
            defaultValue={row.tagline ?? ""}
            placeholder={resolved.tagline}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section
        title="Search & sharing"
        description="What Google and link previews (Facebook, Messenger, etc.) show for the home page."
      >
        <Field
          id="meta_title"
          label="Page title"
          hint="The browser tab and search result title. About 60 characters shows in full."
        >
          <input
            id="meta_title"
            name="meta_title"
            maxLength={120}
            defaultValue={row.meta_title ?? ""}
            placeholder={resolved.homeTitle}
            className={inputClass}
          />
        </Field>

        <Field id="meta_description" label="Description" hint="About 160 characters shows in full.">
          <textarea
            id="meta_description"
            name="meta_description"
            rows={3}
            maxLength={320}
            defaultValue={row.meta_description ?? ""}
            placeholder={resolved.description}
            className={inputClass}
          />
        </Field>

        <Field id="meta_keywords" label="Keywords" hint="Separated by commas. Blank = built from the family name and lines.">
          <input
            id="meta_keywords"
            name="meta_keywords"
            defaultValue={(row.meta_keywords ?? []).join(", ")}
            placeholder={resolved.keywords.join(", ")}
            className={inputClass}
          />
        </Field>

        <ImageField
          name="og_image_url"
          bucket="site-assets"
          label="Share image"
          chooseLabel="Choose image"
          emptyText="No image"
          modalTitle="Choose a share image"
          hint="Shown in link previews. 1200 × 630 works best."
          wide
          initialUrl={row.og_image_url}
        />

        <label className="flex w-fit items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="allow_indexing"
            defaultChecked={row.allow_indexing !== false}
            className="h-4 w-4 rounded border-line"
          />
          Let search engines list this site
        </label>
      </Section>

      <Section title="Family Tree page">
        <Field id="tree_title" label="Title" hint="The page heading and browser tab title.">
          <input
            id="tree_title"
            name="tree_title"
            defaultValue={row.tree_title ?? ""}
            placeholder={resolved.treeTitle}
            className={inputClass}
          />
        </Field>

        <Field id="tree_description" label="Description" hint="Shown above the chart and used in search results.">
          <textarea
            id="tree_description"
            name="tree_description"
            rows={2}
            defaultValue={row.tree_description ?? ""}
            placeholder={resolved.treeDescription}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Other">
        <Field id="announcements_title" label="Announcements heading" hint="The heading of the announcements card on the home page.">
          <input
            id="announcements_title"
            name="announcements_title"
            defaultValue={row.announcements_title ?? ""}
            placeholder={resolved.announcementsTitle}
            className={inputClass}
          />
        </Field>

        <Field id="young_title" label="Youngest-members heading" hint="The heading of the home page card listing the family's youngest members.">
          <input
            id="young_title"
            name="young_title"
            defaultValue={row.young_title ?? ""}
            placeholder={resolved.youngTitle}
            className={inputClass}
          />
        </Field>

        <Field id="young_max_age" label="Youngest-members age limit" hint="Lists living members younger than this many years, youngest first. Whole number, 1–18.">
          <input
            id="young_max_age"
            name="young_max_age"
            type="number"
            min={1}
            max={18}
            step={1}
            defaultValue={row.young_max_age ?? ""}
            placeholder={String(resolved.youngMaxAge)}
            className={inputClass}
          />
        </Field>

        <Field id="timezone" label="Timezone" hint="Used for times shown in this admin, e.g. Asia/Manila. Blank = UTC.">
          <input
            id="timezone"
            name="timezone"
            list="timezone-options"
            defaultValue={row.timezone ?? ""}
            placeholder="UTC"
            className={inputClass}
          />
          <datalist id="timezone-options">
            {timeZones.map((zone) => (
              <option key={zone} value={zone} />
            ))}
          </datalist>
        </Field>
      </Section>

      <div className="flex flex-col items-start gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
        {state?.error ? (
          <p role="alert" className="text-sm font-medium text-red-500">
            {state.error}
          </p>
        ) : null}
        {state?.success ? (
          <p role="status" className="text-sm font-medium text-emerald-500">
            Saved &mdash; the site now uses these settings.
          </p>
        ) : null}
      </div>
    </form>
  );
}
