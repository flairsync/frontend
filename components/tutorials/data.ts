export interface TutorialSection {
  id: string;
  slug: string;
  appRoute?: { href: string };
}

export interface TutorialPart {
  number: number;
  sections: TutorialSection[];
}

export const TUTORIAL_PARTS: TutorialPart[] = [
  { number: 1, sections: [
    { id: "1.1", slug: "1-1", appRoute: { href: "/signup" } },
    { id: "1.2", slug: "1-2", appRoute: { href: "/login" } },
    { id: "1.3", slug: "1-3", appRoute: { href: "/forgot-password" } },
    { id: "1.4", slug: "1-4", appRoute: { href: "/tfa" } },
    { id: "1.5", slug: "1-5", appRoute: { href: "/profile" } },
    { id: "1.6", slug: "1-6", appRoute: { href: "/profile" } },
  ]},
  { number: 2, sections: [
    { id: "2.1", slug: "2-1", appRoute: { href: "/manage/overview" } },
    { id: "2.2", slug: "2-2", appRoute: { href: "/manage/overview" } },
    { id: "2.3", slug: "2-3", appRoute: { href: "/manage/overview" } },
    { id: "2.4", slug: "2-4", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 3, sections: [
    { id: "3.1", slug: "3-1", appRoute: { href: "/manage/overview" } },
    { id: "3.2", slug: "3-2", appRoute: { href: "/manage/overview" } },
    { id: "3.3", slug: "3-3", appRoute: { href: "/manage/overview" } },
    { id: "3.4", slug: "3-4", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 4, sections: [
    { id: "4.1", slug: "4-1", appRoute: { href: "/manage/overview" } },
    { id: "4.2", slug: "4-2", appRoute: { href: "/manage/overview" } },
    { id: "4.3", slug: "4-3", appRoute: { href: "/manage/overview" } },
    { id: "4.4", slug: "4-4", appRoute: { href: "/manage/overview" } },
    { id: "4.5", slug: "4-5", appRoute: { href: "/manage/overview" } },
    { id: "4.6", slug: "4-6", appRoute: { href: "/manage/overview" } },
    { id: "4.7", slug: "4-7", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 5, sections: [
    { id: "5.1", slug: "5-1", appRoute: { href: "/manage/overview" } },
    { id: "5.2", slug: "5-2", appRoute: { href: "/manage/overview" } },
    { id: "5.3", slug: "5-3", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 6, sections: [
    { id: "6.1", slug: "6-1", appRoute: { href: "/manage/overview" } },
    { id: "6.2", slug: "6-2", appRoute: { href: "/manage/overview" } },
    { id: "6.3", slug: "6-3", appRoute: { href: "/manage/overview" } },
    { id: "6.4", slug: "6-4", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 7, sections: [
    { id: "7.1", slug: "7-1", appRoute: { href: "/manage/overview" } },
    { id: "7.2", slug: "7-2", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 8, sections: [
    { id: "8.1", slug: "8-1", appRoute: { href: "/manage/overview" } },
    { id: "8.2", slug: "8-2", appRoute: { href: "/manage/overview" } },
    { id: "8.3", slug: "8-3", appRoute: { href: "/manage/overview" } },
    { id: "8.4", slug: "8-4", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 9, sections: [
    { id: "9.1", slug: "9-1", appRoute: { href: "/manage/overview" } },
    { id: "9.2", slug: "9-2", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 10, sections: [
    { id: "10.1", slug: "10-1", appRoute: { href: "/manage/overview" } },
    { id: "10.2", slug: "10-2", appRoute: { href: "/manage/overview" } },
    { id: "10.3", slug: "10-3", appRoute: { href: "/manage/overview" } },
    { id: "10.4", slug: "10-4", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 11, sections: [
    { id: "11.1", slug: "11-1", appRoute: { href: "/manage/overview" } },
    { id: "11.2", slug: "11-2", appRoute: { href: "/manage/overview" } },
    { id: "11.3", slug: "11-3", appRoute: { href: "/manage/overview" } },
    { id: "11.4", slug: "11-4", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 12, sections: [
    { id: "12.1", slug: "12-1", appRoute: { href: "/notifications" } },
    { id: "12.2", slug: "12-2", appRoute: { href: "/profile" } },
  ]},
  { number: 13, sections: [
    { id: "13.1", slug: "13-1", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 14, sections: [
    { id: "14.1", slug: "14-1", appRoute: { href: "/manage/overview" } },
    { id: "14.2", slug: "14-2", appRoute: { href: "/station/pos" } },
  ]},
  { number: 15, sections: [
    { id: "15.1", slug: "15-1", appRoute: { href: "/feed" } },
    { id: "15.2", slug: "15-2", appRoute: { href: "/feed" } },
    { id: "15.3", slug: "15-3", appRoute: { href: "/feed" } },
    { id: "15.4", slug: "15-4", appRoute: { href: "/feed" } },
  ]},
  { number: 16, sections: [
    { id: "16.1", slug: "16-1", appRoute: { href: "/manage/plans" } },
    { id: "16.2", slug: "16-2", appRoute: { href: "/manage/billing" } },
  ]},
  { number: 17, sections: [
    { id: "17.1", slug: "17-1", appRoute: { href: "/manage/overview" } },
    { id: "17.2", slug: "17-2", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 18, sections: [
    { id: "18.1", slug: "18-1", appRoute: { href: "/manage/overview" } },
    { id: "18.2", slug: "18-2", appRoute: { href: "/manage/overview" } },
    { id: "18.3", slug: "18-3", appRoute: { href: "/jobs" } },
  ]},
  { number: 19, sections: [
    { id: "19.1", slug: "19-1", appRoute: { href: "/manage/overview" } },
    { id: "19.2", slug: "19-2", appRoute: { href: "/manage/overview" } },
  ]},
  { number: 20, sections: [
    { id: "20.1", slug: "20-1", appRoute: { href: "/support" } },
  ]},
  { number: 21, sections: [
    { id: "21.1", slug: "21-1", appRoute: { href: "/profile" } },
    { id: "21.2", slug: "21-2", appRoute: { href: "/profile" } },
  ]},
];

export function findSectionBySlug(slug: string): TutorialSection | undefined {
  for (const part of TUTORIAL_PARTS) {
    const section = part.sections.find((s) => s.slug === slug);
    if (section) return section;
  }
  return undefined;
}

export function findPartForSection(sectionId: string): TutorialPart | undefined {
  return TUTORIAL_PARTS.find((p) => p.sections.some((s) => s.id === sectionId));
}

export function getAllSections(): TutorialSection[] {
  return TUTORIAL_PARTS.flatMap((p) => p.sections);
}
