import { MapService } from "./map.service";
import { Layout } from "./layout";

const init = async () => {
    try {
        await Promise.all([
            import("./style.css"),
            import("bootstrap/dist/css/bootstrap.min.css")
        ]);
        const envConfig = import.meta.env;
        const mapService = await MapService.init(envConfig.VITE_GOOGLE_API_KEY);
        new Layout(mapService).init();
    } catch (e) {
        console.error(e);
    }
};

window.addEventListener("load", init);
