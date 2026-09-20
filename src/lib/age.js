/**
 * Whole years old on `today`, from a "YYYY-MM-DD" date of birth. Compares
 * calendar dates (UTC on both sides), so a birthday only counts once it has
 * actually arrived — someone born 2 Jan is still 0 on 1 Jan of the next year.
 * A 29 Feb birthday is reached on 1 Mar in non-leap years.
 */
export function ageInYears(dateOfBirth, today = new Date()) {
  const dob = new Date(dateOfBirth);
  let age = today.getUTCFullYear() - dob.getUTCFullYear();

  const birthdayNotYetReached =
    today.getUTCMonth() < dob.getUTCMonth() ||
    (today.getUTCMonth() === dob.getUTCMonth() && today.getUTCDate() < dob.getUTCDate());

  return birthdayNotYetReached ? age - 1 : age;
}
