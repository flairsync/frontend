import dayjs from "dayjs";
export class UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  language: string;
  marketingEmails: boolean;
  createdAt: Date;

  constructor(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    language: string,
    marketingEmails: boolean,
    createdAt: Date
  ) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.language = language;
    this.marketingEmails = marketingEmails;
    this.createdAt = createdAt;
  }

  static parseApiResponse(data: any): UserProfile {
    return new UserProfile(
      data.id,
      data.email,
      data.firstName,
      data.lastName,
      data.language,
      data.marketingEmails,
      data.createdAt
    );
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
