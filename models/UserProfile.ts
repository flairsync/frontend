export class UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;

  constructor(id: string, email: string, firstName: string, lastName: string) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  static parseApiResponse(data: any): UserProfile {
    return new UserProfile(data.id, data.email, data.firstName, data.lastName);
  }
}
