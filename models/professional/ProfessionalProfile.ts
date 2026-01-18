import dayjs from "dayjs";

export type PreferredWorkHour = {
  start: string; // "09:00"
  end: string; // "17:00"
};

export class ProfessionalProfile {
  id: string;

  firstName: string;
  middleName?: string | null;
  lastName: string;

  displayName: string;

  workEmail?: string;

  preferredWorkHours?: PreferredWorkHour[];

  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    id: string,
    firstName: string,
    lastName: string,
    displayName: string,
    middleName?: string | null,
    workEmail?: string,
    preferredWorkHours?: PreferredWorkHour[],
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.firstName = firstName;
    this.middleName = middleName;
    this.lastName = lastName;
    this.displayName = displayName;
    this.workEmail = workEmail;
    this.preferredWorkHours = preferredWorkHours;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /** Parse API response into a ProfessionalProfile instance */
  static parseApiResponse(data: any): ProfessionalProfile | null {
    if (!data) return null;

    return new ProfessionalProfile(
      data.id,
      data.firstName,
      data.lastName,
      data.displayName,
      data.middleName ?? null,
      data.workEmail,
      data.preferredWorkHours,
      data.createdAt ? new Date(data.createdAt) : undefined,
      data.updatedAt ? new Date(data.updatedAt) : undefined
    );
  }

  /** Legal / real full name */
  getFullName(): string {
    return [this.firstName, this.middleName, this.lastName]
      .filter(Boolean)
      .join(" ");
  }

  /** Public-facing name */
  getDisplayName(): string {
    return this.displayName || this.getFullName();
  }

  getInitials(): string {
    let initials = "";
    if (this.firstName) initials += this.firstName.charAt(0);
    if (this.lastName) initials += this.lastName.charAt(0);
    return initials.toUpperCase();
  }

  hasWorkEmail(): boolean {
    return !!this.workEmail;
  }

  getCreatedDate(): string | null {
    if (!this.createdAt) return null;
    return dayjs(this.createdAt).format("YYYY-MM-DD");
  }
}
