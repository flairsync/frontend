export class BusinessMedia {
  id: string;
  blurHash: string;
  url: string;
  order: number;

  constructor(id: string, blurhash: string, url: string, order: number) {
    this.id = id;
    this.blurHash = blurhash;
    this.url = url;
    this.order = order;
  }

  static parseApiResponse(respones: any) {
    try {
      return new BusinessMedia(
        respones.id,
        respones.blurHash,
        respones.url,
        respones.order
      );
    } catch (error) {
      return null;
    }
  }

  static parseApiArrayResponse(response: any[]): BusinessMedia[] {
    let res: BusinessMedia[] = [];
    response.forEach((element) => {
      let bm = this.parseApiResponse(element);
      if (bm) res.push(bm);
    });
    return res;
  }
}
