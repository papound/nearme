interface FBModel {
  data: Datum[];
  paging: Paging;
}

interface Paging {
  cursors: Cursors;
  next: string;
  previous: string;
}

interface Cursors {
  before: string;
  after: string;
}

interface Datum {
  id: string;
  name: string;
  overall_star_rating: number;
  link: string;
  picture: Picture;
  single_line_address: string;
  location: Location;
  category_list: Categorylist[];
}

interface Categorylist {
  id: string;
  name: string;
}

interface Location {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  street: string;
  zip: string;
}

interface Picture {
  data: Data;
}

interface Data {
  height: number;
  is_silhouette: boolean;
  url: string;
  width: number;
}
