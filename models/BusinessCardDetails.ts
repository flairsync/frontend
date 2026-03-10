import { DiscoveryBusiness } from "./discovery/DiscoveryBusiness";

export class BusinessCardDetails {
  image: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  description: string;
  rating: number;
  address: string;
  status: string; // open, closed, busy, not busy
  link: string; // new field for URL
  priceLevel: number;
  isFavorite: boolean;

  constructor(
    image: string,
    name: string,
    location: { lat: number; lng: number },
    description: string,
    rating: number,
    address: string,
    status: string,
    link: string,
    priceLevel: number,
    isFavorite: boolean
  ) {
    this.image = image;
    this.name = name;
    this.location = location;
    this.description = description;
    this.rating = rating;
    this.address = address;
    this.status = status;
    this.link = link;
    this.priceLevel = priceLevel;
    this.isFavorite = isFavorite;
  }

  static generateDummyData(): BusinessCardDetails[] {
    return [
      new BusinessCardDetails(
        "https://images.pexels.com/photos/1237073/pexels-photo-1237073.jpeg",
        "Cafe Montserrat",
        { lat: 42.507, lng: 1.521 },
        "Cozy place with a great atmosphere.",
        4.5,
        "Carrer Major 12, Andorra la Vella, Andorra",
        "open",
        "cafe-montserrat",
        2,
        false
      ),
      new BusinessCardDetails(
        "https://images.pexels.com/photos/6152041/pexels-photo-6152041.jpeg",
        "Borda La Vella",
        { lat: 42.534, lng: 1.545 },
        "Perfect spot for coffee and pastries.",
        4.2,
        "Avinguda de Meritxell 8, Andorra la Vella, Andorra",
        "busy",
        "borda-la-vella",
        3,
        false
      ),
      new BusinessCardDetails(
        "https://images.pexels.com/photos/5902957/pexels-photo-5902957.jpeg",
        "Vermuteria Andorra",
        { lat: 42.516, lng: 1.556 },
        "Family-friendly and welcoming.",
        4.8,
        "Carrer de la Vall 5, Escaldes-Engordany, Andorra",
        "closed",
        "vermuteria-andorra",
        1,
        false
      ),
      new BusinessCardDetails(
        "https://images.pexels.com/photos/33899554/pexels-photo-33899554.jpeg",
        "Restaurant Caldea",
        { lat: 42.523, lng: 1.534 },
        "Known for its delicious local dishes.",
        4.6,
        "Avinguda Carlemany 20, Escaldes-Engordany, Andorra",
        "open",
        "restaurant-caldea",
        4,
        false
      ),
      new BusinessCardDetails(
        "https://images.pexels.com/photos/33899422/pexels-photo-33899422.jpeg",
        "Pizzeria La Massana",
        { lat: 42.544, lng: 1.512 },
        "Modern interior and tasty meals.",
        4.3,
        "Carrer de Prat de la Creu 3, La Massana, Andorra",
        "not busy",
        "pizzeria-la-massana",
        2,
        false
      ),
      new BusinessCardDetails(
        "https://images.pexels.com/photos/2159065/pexels-photo-2159065.jpeg",
        "Snack Bar Encamp",
        { lat: 42.534, lng: 1.576 },
        "Quick bites with excellent service.",
        4.0,
        "Carrer del Nord 7, Encamp, Andorra",
        "open",
        "snack-bar-encamp",
        1,
        false
      ),
    ];
  }
  static fromDiscoveryBusiness(b: DiscoveryBusiness): BusinessCardDetails {
    // Current status from backend
    const status = b.isOpen ? "open" : "closed";

    // Address construction: Prefer full address, fallback to City, State, Country
    const countryName = typeof b.country === 'string' ? b.country : b.country?.name;
    const locationParts = [b.city, b.state, countryName].filter(Boolean);
    const address = b.address || (locationParts.length > 0 ? locationParts.join(", ") : "Andorra");

    // Extract coordinates from GeoJSON Point [lng, lat]
    const lat = b.location?.coordinates?.[1] || 0;
    const lng = b.location?.coordinates?.[0] || 0;

    // Use rating from backend if available (even if 0.0), otherwise fallback to 0
    const rating = b.rating ?? 0;

    // Find the first image or logo
    let imageSrc = b.logo || "https://images.pexels.com/photos/1237073/pexels-photo-1237073.jpeg";
    if (!b.logo && b.media?.length > 0) {
      const imageMedia = b.media.find(m => m.url.match(/\.(jpeg|jpg|png|webp|gif)$/i));
      if (imageMedia) imageSrc = imageMedia.url;
      else imageSrc = b.media[0].url; // fallback to first media item if video
    }

    return new BusinessCardDetails(
      imageSrc,
      b.name,
      { lat, lng },
      b.description || b.tags.map(t => t.name).join(", "),
      rating,
      address,
      status,
      b.id,
      b.priceLevel || 1,
      !!b.isFavorite
    );
  }
}
