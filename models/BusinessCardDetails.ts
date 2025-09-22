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

  constructor(
    image: string,
    name: string,
    location: { lat: number; lng: number },
    description: string,
    rating: number,
    address: string,
    status: string,
    link: string
  ) {
    this.image = image;
    this.name = name;
    this.location = location;
    this.description = description;
    this.rating = rating;
    this.address = address;
    this.status = status;
    this.link = link;
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
        "cafe-montserrat"
      ),
      new BusinessCardDetails(
        "https://images.pexels.com/photos/6152041/pexels-photo-6152041.jpeg",
        "Borda La Vella",
        { lat: 42.534, lng: 1.545 },
        "Perfect spot for coffee and pastries.",
        4.2,
        "Avinguda de Meritxell 8, Andorra la Vella, Andorra",
        "busy",
        "borda-la-vella"
      ),
      new BusinessCardDetails(
        "https://images.pexels.com/photos/5902957/pexels-photo-5902957.jpeg",
        "Vermuteria Andorra",
        { lat: 42.516, lng: 1.556 },
        "Family-friendly and welcoming.",
        4.8,
        "Carrer de la Vall 5, Escaldes-Engordany, Andorra",
        "closed",
        "vermuteria-andorra"
      ),
      new BusinessCardDetails(
        "https://images.pexels.com/photos/33899554/pexels-photo-33899554.jpeg",
        "Restaurant Caldea",
        { lat: 42.523, lng: 1.534 },
        "Known for its delicious local dishes.",
        4.6,
        "Avinguda Carlemany 20, Escaldes-Engordany, Andorra",
        "open",
        "restaurant-caldea"
      ),
      new BusinessCardDetails(
        "https://images.pexels.com/photos/33899422/pexels-photo-33899422.jpeg",
        "Pizzeria La Massana",
        { lat: 42.544, lng: 1.512 },
        "Modern interior and tasty meals.",
        4.3,
        "Carrer de Prat de la Creu 3, La Massana, Andorra",
        "not busy",
        "pizzeria-la-massana"
      ),
      new BusinessCardDetails(
        "https://images.pexels.com/photos/2159065/pexels-photo-2159065.jpeg",
        "Snack Bar Encamp",
        { lat: 42.534, lng: 1.576 },
        "Quick bites with excellent service.",
        4.0,
        "Carrer del Nord 7, Encamp, Andorra",
        "open",
        "snack-bar-encamp"
      ),
    ];
  }
}
