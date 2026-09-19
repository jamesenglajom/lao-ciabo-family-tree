import { REMINDER_TYPES } from "@/lib/reminder-types";
import { SubmitButton } from "@/components/admin/submit-button";

const inputClass =
  "rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-ink outline-none focus:border-accent";
const labelClass = "text-sm font-medium text-ink";

export function ReminderForm({ action, reminder, members }) {
  return (
    <form action={action} encType="multipart/form-data" className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className={labelClass}>
            Type
          </label>
          <select id="type" name="type" required defaultValue={reminder?.type ?? ""} className={inputClass}>
            <option value="" disabled>
              Select
            </option>
            {REMINDER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="event_date" className={labelClass}>
            Date
          </label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            defaultValue={reminder?.event_date ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input id="title" name="title" required defaultValue={reminder?.title ?? ""} className={inputClass} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={reminder?.location ?? ""}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="related_member_id" className={labelClass}>
            Related member
          </label>
          <select
            id="related_member_id"
            name="related_member_id"
            defaultValue={reminder?.related_member_id ?? ""}
            className={inputClass}
          >
            <option value="">&mdash;</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cover_image" className={labelClass}>
          Cover image
        </label>
        <input id="cover_image" name="cover_image" type="file" accept="image/*" className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="link" className={labelClass}>
          Post link
        </label>
        <input
          id="link"
          name="link"
          type="url"
          placeholder="https://facebook.com/..."
          defaultValue={reminder?.link ?? ""}
          className={inputClass}
        />
        <span className="text-xs text-ink-faint">
          Link to the Facebook/Instagram/etc. post for this event, if there is one.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={reminder?.description ?? ""}
          className={inputClass}
        />
      </div>

      <label className="flex w-fit items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={reminder ? reminder.is_published : true}
          className="h-4 w-4 rounded border-line"
        />
        Published (visible on the public site)
      </label>

      <SubmitButton
        pendingText={reminder ? "Saving…" : "Posting…"}
        className="w-fit rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
      >
        {reminder ? "Save changes" : "Post announcement"}
      </SubmitButton>
    </form>
  );
}
