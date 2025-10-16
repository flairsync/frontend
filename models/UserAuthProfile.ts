export class UserAuthProfile {
  verified: boolean;
  tfaEnabled: boolean;
  tfaSuccess: boolean;

  constructor(verified: boolean, tfaEnabled: boolean, tfaSuccess: boolean) {
    this.verified = verified;
    this.tfaEnabled = tfaEnabled;
    this.tfaSuccess = tfaSuccess;
  }

  static parseApiResponse(data: any): UserAuthProfile {
    return new UserAuthProfile(data.verified, data.tfaEnabled, data.tfaSuccess);
  }
}
