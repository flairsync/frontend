import { Permission } from "./Permission";

export type PermissionWithFlags = {
  permission: Permission;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export class Role {
  id: string;
  name: string;
  permissions: PermissionWithFlags[];
  employeeCount: number;

  constructor(
    id: string,
    name: string,
    permissions: PermissionWithFlags[] = [],
    employeeCount: number
  ) {
    this.id = id;
    this.name = name;
    this.permissions = permissions;
    this.employeeCount = employeeCount;
  }

  // --- Static parsing methods ---

  static parseApiResponse(data: any): Role | null {
    try {
      const permissions: PermissionWithFlags[] = (data.permissions || []).map(
        (p: any) => ({
          permission: Permission.parseApiResponse(p.permission)!,
          canRead: p.canRead ?? false,
          canCreate: p.canCreate ?? false,
          canUpdate: p.canUpdate ?? false,
          canDelete: p.canDelete ?? false,
        })
      );

      return new Role(data.id, data.name, permissions, data.employeeCount);
    } catch {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): Role[] {
    const arr: Role[] = [];
    data.forEach((val) => {
      const role = this.parseApiResponse(val);
      if (role) arr.push(role);
    });
    return arr;
  }
}
