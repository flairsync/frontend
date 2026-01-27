export class Allergy {
  id: string;
  code: string;
  name: string;

  constructor(id: string, code: string, name: string) {
    this.id = id;
    this.code = code;
    this.name = name;
  }

  static parseApiResponse(data: any): Allergy | null {
    if (!data) return null;
    try {
      return new Allergy(data.id, data.code, data.name);
    } catch (error) {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): Allergy[] {
    if (!data) return [];

    const arr: Allergy[] = [];
    data.forEach((val) => {
      const employee = this.parseApiResponse(val);
      if (employee) arr.push(employee);
    });
    return arr;
  }
}
