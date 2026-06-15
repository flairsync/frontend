import { Permission } from "./Permission";

export type PermissionWithFlags = {
  permission: Permission;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export type PosPermissionFlags = {
  posAccess: boolean;
  kdsAccess: boolean;
  posCreateOrder: boolean;
  posVoidItem: boolean;
  posCancelOrder: boolean;
  posRefund: boolean;
  posApplyDiscount: boolean;
};

export class Role {
  id: string;
  name: string;
  permissions: PermissionWithFlags[];
  employeeCount: number;
  posAccess: boolean;
  kdsAccess: boolean;
  posCreateOrder: boolean;
  posVoidItem: boolean;
  posCancelOrder: boolean;
  posRefund: boolean;
  posApplyDiscount: boolean;

  constructor(
    id: string,
    name: string,
    permissions: PermissionWithFlags[] = [],
    employeeCount: number,
    posFlags?: Partial<PosPermissionFlags>
  ) {
    this.id = id;
    this.name = name;
    this.permissions = permissions;
    this.employeeCount = employeeCount;
    this.posAccess = posFlags?.posAccess ?? false;
    this.kdsAccess = posFlags?.kdsAccess ?? false;
    this.posCreateOrder = posFlags?.posCreateOrder ?? false;
    this.posVoidItem = posFlags?.posVoidItem ?? false;
    this.posCancelOrder = posFlags?.posCancelOrder ?? false;
    this.posRefund = posFlags?.posRefund ?? false;
    this.posApplyDiscount = posFlags?.posApplyDiscount ?? false;
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

      return new Role(data.id, data.name, permissions, data.employeeCount, {
        posAccess: data.posAccess ?? false,
        kdsAccess: data.kdsAccess ?? false,
        posCreateOrder: data.posCreateOrder ?? false,
        posVoidItem: data.posVoidItem ?? false,
        posCancelOrder: data.posCancelOrder ?? false,
        posRefund: data.posRefund ?? false,
        posApplyDiscount: data.posApplyDiscount ?? false,
      });
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
