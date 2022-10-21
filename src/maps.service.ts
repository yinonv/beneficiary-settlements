import { Loader } from '@googlemaps/js-api-loader';

export class MapService {
  constructor(private maps: typeof google.maps, private map: google.maps.Map) {}

  public static async init(apiKey: string) {
    const loader = new Loader({ apiKey });
    const google = await loader.load();
    const mapOptions = {
      center: {
        lat: 32.087371715198124,
        lng: 34.88346341137375,
      },
      zoom: 8,
    };
    const mapElement = document.createElement('div');
    mapElement.id = 'map';
    document.getElementById('app')?.append(mapElement);
    const { maps } = google;
    const map = new maps.Map(mapElement, mapOptions);
    return new MapService(maps, map);
  }

  public addMarker(
    position: google.maps.LatLng|null|google.maps.LatLngLiteral,
    icon: string,
    toolTip: string
  ) {
    new this.maps.Marker({
      position,
      icon,
      title: toolTip,
      map: this.map,
      animation: google.maps.Animation.DROP,
    });
  }
}
