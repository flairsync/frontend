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
}
