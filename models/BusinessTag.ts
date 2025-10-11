export class BusinessTag {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static generateDummyData(): BusinessTag[] {
    const data = [
      { id: "1", name: "halal" },
      { id: "2", name: "vegan" },
      { id: "3", name: "vegetarian" },
      { id: "4", name: "gluten_free" },
      { id: "5", name: "organic" },
      { id: "6", name: "kosher" },
      { id: "7", name: "dairy_free" },
      { id: "8", name: "nut_free" },
      { id: "9", name: "locally_sourced" },
      { id: "10", name: "fair_trade" },
      { id: "11", name: "pet_friendly" },
      { id: "12", name: "outdoor_seating" },
      { id: "13", name: "takeaway" },
      { id: "14", name: "delivery" },
      { id: "15", name: "kid_friendly" },
      { id: "16", name: "wifi" },
      { id: "17", name: "wheelchair_accessible" },
    ];

    return data.map((tag) => new BusinessTag(tag.id, tag.name));
  }
}
