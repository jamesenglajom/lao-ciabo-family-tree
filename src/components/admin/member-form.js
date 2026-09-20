import { ImageField } from "@/components/admin/image-field";
import { SocialLinksEditor } from "@/components/admin/social-links-editor";
import { SpouseEditor } from "@/components/admin/spouse-editor";
import { SubmitButton } from "@/components/admin/submit-button";

const inputClass =
  "rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-ink outline-none focus:border-accent";
const labelClass = "text-sm font-medium text-ink";

export function MemberForm({
  action,
  member,
  members,
  currentSpouseIds = [],
  currentSocialLinks = [],
  lockedFather = null,
  lockedMother = null,
}) {
  const otherMembers = members.filter((m) => m.id !== member?.id);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className={labelClass}>
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          defaultValue={member?.full_name ?? ""}
          className={inputClass}
        />
      </div>

      <ImageField name="photo_url" bucket="member-photos" initialUrl={member?.photo_url} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="gender" className={labelClass}>
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            required
            defaultValue={member?.gender ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select
            </option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="date_of_birth" className={labelClass}>
            Date of birth
          </label>
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            defaultValue={member?.date_of_birth ?? ""}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="date_of_death" className={labelClass}>
            Date of death
          </label>
          <input
            id="date_of_death"
            name="date_of_death"
            type="date"
            defaultValue={member?.date_of_death ?? ""}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="father_id" className={labelClass}>
            Father
          </label>
          {lockedFather ? (
            <select id="father_id" disabled className={`${inputClass} opacity-60`}>
              <option>{lockedFather.full_name}</option>
            </select>
          ) : (
            <select
              id="father_id"
              name="father_id"
              defaultValue={member?.father_id ?? ""}
              className={inputClass}
            >
              <option value="">&mdash;</option>
              {otherMembers
                .filter((m) => m.gender === "M")
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
            </select>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="mother_id" className={labelClass}>
            Mother
          </label>
          {lockedMother ? (
            <select id="mother_id" disabled className={`${inputClass} opacity-60`}>
              <option>{lockedMother.full_name}</option>
            </select>
          ) : (
            <select
              id="mother_id"
              name="mother_id"
              defaultValue={member?.mother_id ?? ""}
              className={inputClass}
            >
              <option value="">&mdash;</option>
              {otherMembers
                .filter((m) => m.gender === "F")
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
            </select>
          )}
        </div>
      </div>

      {lockedFather || lockedMother ? (
        <p className="-mt-2 text-xs text-ink-faint">
          A parent shown greyed out is outside your assigned branch, so only an admin can change it.
          It stays linked when you save.
        </p>
      ) : null}

      <SpouseEditor currentSpouseIds={currentSpouseIds} members={otherMembers} />

      <SocialLinksEditor currentLinks={currentSocialLinks} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={member?.description ?? ""}
          className={inputClass}
        />
      </div>

      <SubmitButton
        pendingText={member ? "Saving…" : "Adding…"}
        className="w-fit rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
      >
        {member ? "Save changes" : "Add member"}
      </SubmitButton>
    </form>
  );
}
