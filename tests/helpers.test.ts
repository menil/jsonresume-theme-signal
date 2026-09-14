import { describe, expect, it } from "bun:test";
import Handlebars from "handlebars";
import {
  formatDates,
  getEndYear,
  getGitHub,
  getLinkedIn,
  getProfile,
  groupWork,
  prepareResume,
  registerHelpers,
  stripUrl,
} from "../src/helpers.ts";
import type { ResumeData, ResumeWork } from "../src/types.ts";

describe("Handlebars & Theme Helpers", () => {
  describe("getProfile, getLinkedIn & getGitHub", () => {
    const profiles = [
      { network: "Twitter", url: "https://twitter.com/janedoe" },
      { network: "LinkedIn", url: "https://linkedin.com/in/janedoe" },
      { network: "GitHub", url: "https://github.com/janedoe" },
    ];

    it("extracts arbitrary profile URL (case-insensitive)", () => {
      expect(getProfile(profiles, "twitter")).toBe("https://twitter.com/janedoe");
      expect(getProfile(profiles, "TWITTER")).toBe("https://twitter.com/janedoe");
    });

    it("extracts LinkedIn profile URL (case-insensitive)", () => {
      expect(getLinkedIn(profiles)).toBe("https://linkedin.com/in/janedoe");
    });

    it("returns empty string if LinkedIn profile is not present", () => {
      expect(getLinkedIn([])).toBe("");
      expect(getLinkedIn(undefined)).toBe("");
    });

    it("extracts GitHub profile URL (case-insensitive)", () => {
      expect(getGitHub(profiles)).toBe("https://github.com/janedoe");
    });

    it("returns empty string if GitHub profile is not present", () => {
      expect(getGitHub([])).toBe("");
    });
  });

  describe("getEndYear", () => {
    it("extracts 4-digit start year", () => {
      expect(getEndYear("2024-05-01")).toBe(2024);
      expect(getEndYear("2018")).toBe(2018);
      expect(getEndYear("Present")).toBe(null);
    });

    it("returns null for missing or invalid dates", () => {
      expect(getEndYear(undefined)).toBe(null);
      expect(getEndYear("")).toBe(null);
      expect(getEndYear("abc")).toBe(null);
    });
  });

  describe("formatDates", () => {
    it("formats start and end", () => {
      expect(formatDates("2018", "2020")).toBe("2018 \u2013 2020");
    });

    it("formats end only", () => {
      expect(formatDates("", "2020")).toBe("2020");
    });

    it("formats start only as Present", () => {
      expect(formatDates("2020", "")).toBe("2020 \u2013 Present");
    });

    it("returns empty string for empty inputs", () => {
      expect(formatDates("", "")).toBe("");
    });
  });

  describe("groupWork", () => {
    it("returns empty array for empty work", () => {
      expect(groupWork([])).toEqual([]);
    });

    it("groups consecutive roles under same company", () => {
      const work: ResumeWork[] = [
        {
          name: "Acme Corp",
          position: "Staff Engineer",
          startDate: "2022",
          endDate: "2024",
          highlights: ["H1"],
        },
        {
          name: "Acme Corp",
          position: "Senior Engineer",
          startDate: "2020",
          endDate: "2022",
          highlights: ["H2"],
        },
        {
          name: "Other Inc",
          position: "Engineer",
          startDate: "2018",
          endDate: "2020",
          highlights: ["H3"],
        },
      ];

      const grouped = groupWork(work);
      expect(grouped.length).toBe(2);
      expect(grouped[0].name).toBe("Acme Corp");
      expect(grouped[0].roles?.length).toBe(2);
      expect(grouped[0].roles?.[0].position).toBe("Staff Engineer");
      expect(grouped[0].roles?.[1].position).toBe("Senior Engineer");
      expect(grouped[1].name).toBe("Other Inc");
      expect(grouped[1].roles?.length).toBe(1);
    });
  });

  describe("prepareResume", () => {
    it("partitions early career (>10 years) and formats basics", () => {
      const resume: ResumeData = {
        basics: {
          name: "Jane Doe",
          profiles: [{ network: "LinkedIn", url: "https://linkedin.com/in/janedoe" }],
        },
        work: [
          {
            name: "Recent Co",
            position: "Lead",
            startDate: "2020",
            endDate: "2024",
          },
          {
            name: "Old Co",
            position: "Junior Dev",
            startDate: "2008",
            endDate: "2012",
          },
        ],
      };

      const prepared = prepareResume(resume, 2026);
      expect(prepared.basics?.linkedin).toBe("https://linkedin.com/in/janedoe");
      expect(prepared.basics?.pdf_url).toBe("jane_doe_resume.pdf");
      expect(prepared.work?.length).toBe(1);
      expect(prepared.work?.[0].name).toBe("Recent Co");
      expect(prepared.early_career?.length).toBe(1);
      expect(prepared.early_career?.[0].details).toBe("Junior Dev, Old Co");
    });

    it("does not classify active/open-ended role as early career", () => {
      const resume: ResumeData = {
        work: [
          {
            name: "Long Running Project",
            position: "Founder",
            startDate: "2010",
            endDate: "",
          },
        ],
      };

      const prepared = prepareResume(resume, 2026);
      expect(prepared.work?.length).toBe(1);
      expect(prepared.early_career).toBeUndefined();
    });
  });

  describe("stripUrl", () => {
    it("strips http://, https://, and www.", () => {
      expect(stripUrl("https://www.linkedin.com/in/janedoe")).toBe("linkedin.com/in/janedoe");
      expect(stripUrl("http://example.com")).toBe("example.com");
      expect(stripUrl("www.example.com")).toBe("example.com");
      expect(stripUrl("")).toBe("");
    });
  });

  describe("registerHelpers", () => {
    it("registers helpers and evaluates templates correctly", () => {
      const hbs = Handlebars.create();
      registerHelpers(hbs);

      const template = hbs.compile(
        "{{stripUrl url}} | {{formatDates start end}} | {{join list ', '}} | {{#if (eq a b)}}equal{{/if}} | {{#if (contains str 'abc')}}has_abc{{/if}} | {{#if (or x y)}}has_truthy{{/if}} | {{#if (and x z)}}has_both{{/if}}",
      );

      const result = template({
        url: "https://www.example.com/page",
        start: "2020",
        end: "2024",
        list: ["A", "B", "C"],
        a: "test",
        b: "test",
        str: "123abc456",
        x: true,
        y: false,
        z: true,
      });

      expect(result).toBe(
        "example.com/page | 2020 \u2013 2024 | A, B, C | equal | has_abc | has_truthy | has_both",
      );
    });
  });
});
