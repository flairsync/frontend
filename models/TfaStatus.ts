export class TfaStatus {
  tfaEnabled: boolean;
  tfaSuccess: boolean;
  trustedDevice: boolean;
  tfaSetup: boolean;

  constructor(
    tfaEnabled: boolean,
    tfaSuccess: boolean,
    trustedDevice: boolean,
    tfaSetup?: boolean
  ) {
    this.tfaEnabled = tfaEnabled;
    this.tfaSuccess = tfaSuccess;
    this.trustedDevice = trustedDevice;
    this.tfaSetup = tfaSetup || false;
  }

  static parseApiResponse(data: any): TfaStatus {
    return new TfaStatus(
      data.tfaEnabled,
      data.tfaSuccess,
      data.trustedDevice,
      data.tfaSetup
    );
  }
}
