import { Loader } from "@googlemaps/js-api-loader";

export class MapService {
    private markers: google.maps.marker.AdvancedMarkerElement[];

    constructor(
        private maps: google.maps.MapsLibrary,
        private map: google.maps.Map,
        private marker: google.maps.MarkerLibrary
    ) {
        this.markers = [];
    }

    public static async init(apiKey: string) {
        const loader = new Loader({ apiKey });
        const [maps, marker] = await Promise.all([
            loader.importLibrary("maps"),
            loader.importLibrary("marker")
        ]);
        const mapOptions = {
            center: {
                lat: 32.087371715198124,
                lng: 34.88346341137375
            },
            zoom: 8,
            mapId: "1"
        };
        const mapElement = document.getElementById("map") as HTMLElement;
        const map = new maps.Map(mapElement, mapOptions);
        return new MapService(maps, map, marker);
    }

    public addMarker(
        position: google.maps.LatLng | null | google.maps.LatLngLiteral,
        icon: string,
        title: string,
        text: string,
    ) {
        const content = document.createElement("img");
        content.src = icon;
        const marker = new this.marker.AdvancedMarkerElement({
            position,
            content,
            title,
            map: this.map
        });
        const infoWindow = new this.maps.InfoWindow();
        marker.addListener("click", () => {
            infoWindow.close();
            infoWindow.setContent(text);
            infoWindow.open(marker.map, marker);
        });
        this.markers.push(marker);
    }

    public showMarkers(icon: string) {
        this.setMarkersByIcon(icon, true);
    }

    public hideMarkers(icon: string) {
        this.setMarkersByIcon(icon, false);
    }

    public clearMarkers() {
        for (const marker of this.markers) {
            marker.map = null;
        }
        this.markers = [];
    }

    private setMarkersByIcon(icon: string, isVisible: boolean) {
        for (const marker of this.markers) {
            // @ts-ignore
            if (marker.content?.src.includes(icon)) {
                marker.map = isVisible ? this.map : null;
            }
        }
    }
}
