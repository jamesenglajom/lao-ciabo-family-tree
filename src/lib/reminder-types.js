/** Shared with the admin form and the public announcements tile. */
export const REMINDER_TYPES = [
  { value: "birth_announcement", label: "New Birth" },
  { value: "death_announcement", label: "In Memoriam" },
  { value: "birthday", label: "Birthday" },
  { value: "wedding", label: "Wedding" },
  { value: "anniversary", label: "Anniversary" },
  { value: "reunion", label: "Reunion" },
  { value: "graduation", label: "Graduation" },
  { value: "achievement", label: "Achievement" },
  { value: "general_announcement", label: "Announcement" },
  { value: "other", label: "Other" },
];

export function reminderTypeLabel(value) {
  return REMINDER_TYPES.find((t) => t.value === value)?.label ?? "Announcement";
}
