export class Permission {
  id: string;
  key: string; // e.g. 'RESERVATIONS', 'MENU'
  label: string; // e.g. 'Reservation Management'

  constructor(id: string, key: string, label: string) {
    this.id = id;
    this.key = key;
    this.label = label;
  }

  static parseApiResponse(data: any): Permission | null {
    try {
      return new Permission(data.id, data.key, data.label);
    } catch {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): Permission[] {
    const arr: Permission[] = [];
    data.forEach((val) => {
      const perm = this.parseApiResponse(val);
      if (perm) arr.push(perm);
    });
    return arr;
  }
}
