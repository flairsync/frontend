import { ProfessionalProfile } from "../professional/ProfessionalProfile";

export class BusinessEmployee {
  id: string;
  professionalProfile: ProfessionalProfile | null;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  constructor(
    id: string,
    professionalProfile: ProfessionalProfile | null,
    type: string,
    status: string,
    createdAt: string,
    updatedAt: string
  ) {
    this.id = id;
    this.professionalProfile = professionalProfile;
    this.type = type;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static parseApiResponse(data: any): BusinessEmployee | null {
    if (!data) return null;
    try {
      return new BusinessEmployee(
        data.id,
        ProfessionalProfile.parseApiResponse(data.professionalProfile),
        data.type,
        data.status,
        data.createdAt,
        data.updatedAt
      );
    } catch (error) {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): BusinessEmployee[] {
    const arr: BusinessEmployee[] = [];
    data.forEach((val) => {
      const employee = this.parseApiResponse(val);
      if (employee) arr.push(employee);
    });
    return arr;
  }
}
