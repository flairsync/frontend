import dayjs from "dayjs";
import { Subscription } from "./Subscription";
import { PlatformCountry } from "./shared/PlatformCountry";
export class UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  language: string;
  marketingEmails: boolean;
  createdAt: Date;
  currentSubscription?: Subscription;
  phoneNumber?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  dateOfBirth?: string;
  gender?: string;
  countryId?: number;
  country?: PlatformCountry;
  deletionRequestedAt?: string | null;

  constructor(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    language: string,
    marketingEmails: boolean,
    createdAt: Date,
    currentSubscription?: Subscription,
    phoneNumber?: string,
    emailVerified?: boolean,
    phoneVerified?: boolean,
    dateOfBirth?: string,
    gender?: string,
    countryId?: number,
    country?: PlatformCountry,
    deletionRequestedAt?: string | null
  ) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.language = language;
    this.marketingEmails = marketingEmails;
    this.createdAt = createdAt;
    this.currentSubscription = currentSubscription;
    this.phoneNumber = phoneNumber;
    this.emailVerified = emailVerified;
    this.phoneVerified = phoneVerified;
    this.dateOfBirth = dateOfBirth;
    this.gender = gender;
    this.countryId = countryId;
    this.country = country;
    this.deletionRequestedAt = deletionRequestedAt;
  }

  static parseApiResponse(data: any): UserProfile {
    const sub = Subscription.parseApiResponse(data.currentSubscription);
    const countryObj = PlatformCountry.parseApiResponse(data.country);
    return new UserProfile(
      data.id,
      data.email,
      data.firstName,
      data.lastName,
      data.language,
      data.marketingEmails,
      data.createdAt,
      sub ? sub : undefined,
      data.phoneNumber,
      data.emailVerified,
      data.phoneVerified,
      data.dateOfBirth,
      data.gender,
      data.countryId,
      countryObj ? countryObj : undefined,
      data.deletionRequestedAt ?? null
    );
  }

  getScheduledDeletionDate(): Date | null {
    if (!this.deletionRequestedAt) return null;
    return new Date(new Date(this.deletionRequestedAt).getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  getFullName() {
    let name = "";
    if (this.firstName) name += this.firstName;
    if (this.lastName) name += " " + this.lastName;
    return name;
  }

  getInitials() {
    let init = "";
    if (this.firstName) init += this.firstName.charAt(0);
    if (this.lastName) init += this.lastName.charAt(0);
    return init;
  }

  getJoinDate() {
    return dayjs(this.createdAt).format("YYYY - MM - DD");
  }
}
