import type { Announcement } from "../data/site";

/** Анонс показывается до конца дня `until` по московскому времени. */
export function activeAnnouncement(
  announcement: Announcement | null,
  now = new Date(),
): Announcement | null {
  if (!announcement) {
    return null;
  }
  const lastMoment = new Date(`${announcement.until}T23:59:59+03:00`);
  return now <= lastMoment ? announcement : null;
}
