import { Loader } from '@googlemaps/js-api-loader';

export class MapService {
  private markers: google.maps.Marker[];
  constructor(private maps: typeof google.maps, private map: google.maps.Map) {
    this.markers = [];
  }

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
    const mapElement = document.getElementById('map') as HTMLElement;
    const { maps } = google;
    const map = new maps.Map(mapElement, mapOptions);
    return new MapService(maps, map);
  }

  public addMarker(
    position: google.maps.LatLng | null | google.maps.LatLngLiteral,
    icon: string,
    toolTip: string
  ) {
    const marker = new this.maps.Marker({
      position,
      icon,
      title: toolTip,
      map: this.map,
      animation: google.maps.Animation.DROP,
    });
    this.markers.push(marker);
  }

  public showMarkers(icon: string) {
    this.setMarkersByIcon(icon, true);
  }

  public hideMarkers(icon: string) {
    this.setMarkersByIcon(icon, false);
  }

  private setMarkersByIcon(icon: string, isVisible: boolean) {
    for (const marker of this.markers) {
      if (marker.getIcon() === icon) {
        marker.setMap(isVisible ? this.map : null);
      }
    }
  }
}
