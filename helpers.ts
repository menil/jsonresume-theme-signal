import type {
  EarlyCareerItem,
  PreparedResumeData,
  ResumeData,
  ResumeProfile,
  ResumeWork,
} from "./types.ts";

/**
 * Extracts a profile URL matching a given network name (case-insensitive).
 */
export function getProfile(profiles: ResumeProfile[] | undefined, network: string): string {
  if (!profiles || !Array.isArray(profiles)) return "";
  const match = profiles.find((p) => p.network?.toLowerCase() === network.toLowerCase());
  return match?.url || "";
}

export function getLinkedIn(profiles: ResumeProfile[] | undefined): string {
  return getProfile(profiles, "linkedin");
}

export function getGitHub(profiles: ResumeProfile[] | undefined): string {
  return getProfile(profiles, "github");
}

/**
 * Extracts the 4-digit ending year from a date string.
 */
export function getEndYear(dateStr?: string): number | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const match = dateStr.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? Number.parseInt(match[1], 10) : null;
}

/**
 * Formats start and end dates cleanly (e.g., "2020 – Present", "2018 – 2020").
 */
export function formatDates(startDate?: string, endDate?: string): string {
  if (startDate && endDate) {
    return `${startDate} \u2013 ${endDate}`;
  }
  if (startDate && !endDate) {
    return `${startDate} \u2013 Present`;
  }
  if (!startDate && endDate) {
    return endDate;
  }
  return "";
}

/**
 * Strips protocol and leading 'www.' from URLs for clean print rendering.
 */
export function stripUrl(url?: string): string {
  if (!url) return "";
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
}

/**
 * Groups consecutive roles at the same company together.
 */
export function groupWork(workList: ResumeWork[]): ResumeWork[] {
  if (!workList || workList.length === 0) return [];

  const grouped: ResumeWork[] = [];

  for (const item of workList) {
    const role = {
      position: item.position || "",
      startDate: item.startDate,
      endDate: item.endDate,
      dates: formatDates(item.startDate, item.endDate),
      summary: item.summary,
      highlights: item.highlights || [],
    };

    const prev = grouped[grouped.length - 1];
    if (prev?.name && item.name && prev.name.trim() === item.name.trim()) {
      prev.roles = prev.roles || [];
      prev.roles.push(role);
    } else {
      grouped.push({
        name: item.name,
        url: item.url,
        description: item.description || item.summary,
        roles: [role],
      });
    }
  }

  return grouped;
}

/**
 * Prepares resume data:
 * - Partitions work experience older than 10 years into early career summary items.
 * - Extracts social links into basics.
 * - Groups multiple roles under the same company.
 */
export function prepareResume(data: ResumeData, asOfYear?: number): PreparedResumeData {
  const currentYear = asOfYear ?? new Date().getFullYear();
  const cutoffYear = currentYear - 10;

  const rawWork = data.work || [];
  const professionalWork: ResumeWork[] = [];
  const earlyCareerList: EarlyCareerItem[] = [];

  for (const w of rawWork) {
    const endYr = getEndYear(w.endDate);
    const isOngoing = !w.endDate;
    const isEarly = !isOngoing && endYr !== null && endYr < cutoffYear;

    if (isEarly) {
      const dates = formatDates(w.startDate, w.endDate);
      const company = w.name || "";
      const position = w.position || "";
      const details = position && company ? `${position}, ${company}` : position || company;

      earlyCareerList.push({
        dates,
        details,
      });
    } else {
      professionalWork.push(w);
    }
  }

  const groupedWork = groupWork(professionalWork);

  const basics = data.basics ? { ...data.basics } : {};
  if (!basics.linkedin) {
    basics.linkedin = getLinkedIn(basics.profiles);
  }
  if (!basics.github) {
    basics.github = getGitHub(basics.profiles);
  }
  if (!basics.pdf_url && basics.name) {
    const slug = basics.name.toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
    basics.pdf_url = `${slug}_resume.pdf`;
  }

  return {
    ...data,
    basics,
    work: groupedWork,
    early_career: earlyCareerList.length > 0 ? earlyCareerList : data.early_career,
  };
}

/**
 * Registers all custom helpers onto a Handlebars instance.
 */
export function registerHelpers(hbs: typeof import("handlebars")): void {
  hbs.registerHelper("formatDates", (startDate: string, endDate: string) =>
    formatDates(startDate, endDate),
  );
  hbs.registerHelper("stripUrl", (url: string) => stripUrl(url));
  hbs.registerHelper("join", (arr: string[] | undefined, separator: string) => {
    if (!Array.isArray(arr)) return "";
    return arr.join(typeof separator === "string" ? separator : ", ");
  });
  hbs.registerHelper("eq", (a: unknown, b: unknown) => a === b);
  hbs.registerHelper("contains", (str: unknown, substr: unknown) => {
    if (typeof str !== "string" || typeof substr !== "string") return false;
    return str.includes(substr);
  });
  hbs.registerHelper("or", (...args: unknown[]) => {
    const items = args.slice(0, -1);
    return items.some((item) => Boolean(item));
  });
  hbs.registerHelper("and", (...args: unknown[]) => {
    const items = args.slice(0, -1);
    return items.every((item) => Boolean(item));
  });
}
