export interface TutorialSection {
  id: string;
  slug: string;
}

export interface TutorialPart {
  number: number;
  sections: TutorialSection[];
}

export const TUTORIAL_PARTS: TutorialPart[] = [
  { number: 1, sections: [
    { id: "1.1", slug: "1-1" },
    { id: "1.2", slug: "1-2" },
    { id: "1.3", slug: "1-3" },
    { id: "1.4", slug: "1-4" },
    { id: "1.5", slug: "1-5" },
    { id: "1.6", slug: "1-6" },
  ]},
  { number: 2, sections: [
    { id: "2.1", slug: "2-1" },
    { id: "2.2", slug: "2-2" },
    { id: "2.3", slug: "2-3" },
    { id: "2.4", slug: "2-4" },
  ]},
  { number: 3, sections: [
    { id: "3.1", slug: "3-1" },
    { id: "3.2", slug: "3-2" },
    { id: "3.3", slug: "3-3" },
    { id: "3.4", slug: "3-4" },
  ]},
  { number: 4, sections: [
    { id: "4.1", slug: "4-1" },
    { id: "4.2", slug: "4-2" },
    { id: "4.3", slug: "4-3" },
    { id: "4.4", slug: "4-4" },
    { id: "4.5", slug: "4-5" },
    { id: "4.6", slug: "4-6" },
    { id: "4.7", slug: "4-7" },
  ]},
  { number: 5, sections: [
    { id: "5.1", slug: "5-1" },
    { id: "5.2", slug: "5-2" },
    { id: "5.3", slug: "5-3" },
  ]},
  { number: 6, sections: [
    { id: "6.1", slug: "6-1" },
    { id: "6.2", slug: "6-2" },
    { id: "6.3", slug: "6-3" },
    { id: "6.4", slug: "6-4" },
  ]},
  { number: 7, sections: [
    { id: "7.1", slug: "7-1" },
    { id: "7.2", slug: "7-2" },
  ]},
  { number: 8, sections: [
    { id: "8.1", slug: "8-1" },
    { id: "8.2", slug: "8-2" },
    { id: "8.3", slug: "8-3" },
    { id: "8.4", slug: "8-4" },
  ]},
  { number: 9, sections: [
    { id: "9.1", slug: "9-1" },
    { id: "9.2", slug: "9-2" },
  ]},
  { number: 10, sections: [
    { id: "10.1", slug: "10-1" },
    { id: "10.2", slug: "10-2" },
    { id: "10.3", slug: "10-3" },
    { id: "10.4", slug: "10-4" },
  ]},
  { number: 11, sections: [
    { id: "11.1", slug: "11-1" },
    { id: "11.2", slug: "11-2" },
    { id: "11.3", slug: "11-3" },
    { id: "11.4", slug: "11-4" },
  ]},
  { number: 12, sections: [
    { id: "12.1", slug: "12-1" },
    { id: "12.2", slug: "12-2" },
  ]},
  { number: 13, sections: [
    { id: "13.1", slug: "13-1" },
  ]},
  { number: 14, sections: [
    { id: "14.1", slug: "14-1" },
    { id: "14.2", slug: "14-2" },
  ]},
  { number: 15, sections: [
    { id: "15.1", slug: "15-1" },
    { id: "15.2", slug: "15-2" },
    { id: "15.3", slug: "15-3" },
    { id: "15.4", slug: "15-4" },
  ]},
  { number: 16, sections: [
    { id: "16.1", slug: "16-1" },
    { id: "16.2", slug: "16-2" },
  ]},
  { number: 17, sections: [
    { id: "17.1", slug: "17-1" },
    { id: "17.2", slug: "17-2" },
  ]},
  { number: 18, sections: [
    { id: "18.1", slug: "18-1" },
    { id: "18.2", slug: "18-2" },
    { id: "18.3", slug: "18-3" },
  ]},
  { number: 19, sections: [
    { id: "19.1", slug: "19-1" },
    { id: "19.2", slug: "19-2" },
  ]},
  { number: 20, sections: [
    { id: "20.1", slug: "20-1" },
  ]},
  { number: 21, sections: [
    { id: "21.1", slug: "21-1" },
    { id: "21.2", slug: "21-2" },
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
