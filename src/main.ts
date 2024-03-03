import GreenMarkerIcon from "/green_MarkerA.png";
import BlueMarkerIcon from "/blue_MarkerB.png";
import YellowMarkerIcon from "/yellow_MarkerC.png";
import OrangeMarkerIcon from "/orange_MarkerD.png";
import RedMarkerIcon from "/red_MarkerE.png";
import { MapService } from "./maps.service";
import {
    dataByYear,
    indexToGroup,
    Ranges,
    Year
} from "./data/beneficiary-settlement";

const numFormatter = new Intl.NumberFormat("he-IL", {
    maximumSignificantDigits: 5
});

const envConfig = import.meta.env;

const onLegendClick = () => {
    legendBtn.hidden = true;
    sidePanel.hidden = false;
};

const onCloseLegendClick = () => {
    sidePanel.hidden = true;
    legendBtn.hidden = false;
};

const sidePanel = document.getElementById("side-panel") as HTMLElement;
const legendBtn = document.getElementById("legend") as HTMLElement;
const sidePanelCloseBtn = document.getElementById(
    "side-panel-close-btn"
) as HTMLElement;
const yearElement = document.getElementById("year");
const legendTitle = document.querySelector('[type="tax-return-title"]');
const taxRanges = document.querySelectorAll('[type="tax-return"]');
const checkBoxes = document.querySelectorAll("input");

legendBtn.addEventListener("click", onLegendClick);
sidePanelCloseBtn.addEventListener("click", onCloseLegendClick);

const MarkerIcons = {
    A: GreenMarkerIcon,
    B: BlueMarkerIcon,
    C: YellowMarkerIcon,
    D: OrangeMarkerIcon,
    E: RedMarkerIcon
};

const getMarkerLabel = (maxTaxReturn: number, ranges: Ranges) => {
    if (maxTaxReturn > ranges.B.max) {
        return "A";
    }
    if (maxTaxReturn > ranges.C.max) {
        return "B";
    }
    if (maxTaxReturn > ranges.D.max) {
        return "C";
    }
    if (maxTaxReturn > ranges.E.max) {
        return "D";
    }
    return "E";
};

const drawMap = (mapService: MapService, year: string) => {
    mapService.clearMarkers();
    const { data, ranges } = dataByYear[year as Year];
    legendTitle!.textContent = `Max Tax Return (${year})`;
    taxRanges.forEach((tr, i) => {
        const target = tr as HTMLImageElement;
        // @ts-ignore
        const range = ranges[indexToGroup[String(i)]];
        const min = numFormatter.format(range.min);
        const max = numFormatter.format(range.max);
        target.textContent =
            range.min == range.max ? `${max}₪` : `${min}₪ - ${max}₪`;
    });
    for (const bs of data) {
        const maxTaxReturn = Math.floor((bs.maxIncome * bs.percent) / 100);
        bs.label = getMarkerLabel(maxTaxReturn, ranges);
        mapService.addMarker(
            bs.coordinates,
            MarkerIcons[bs.label],
            String(maxTaxReturn)
        );
    }
    checkBoxes.forEach((cb) => {
        // reset checkboxes
        const target = cb as HTMLInputElement;
        target.checked = true;
    });
};

const init = async () => {
    await Promise.all([
        import("./style.css"),
        import("bootstrap/dist/css/bootstrap.min.css")
    ]);
    try {
        const mapService = await MapService.init(envConfig.VITE_GOOGLE_API_KEY);
        drawMap(mapService, "2024");
        yearElement!.addEventListener("change", (e) => {
            const target = e?.target as HTMLSelectElement;
            const year = target.value;
            drawMap(mapService, year);
        });
        checkBoxes.forEach((cb) => {
            cb.addEventListener("click", (e) => {
                const target = e?.target as HTMLInputElement;
                const label = target.value as keyof typeof MarkerIcons;
                if (target.checked) {
                    mapService.showMarkers(MarkerIcons[label]);
                } else {
                    mapService.hideMarkers(MarkerIcons[label]);
                }
            });
        });
        sidePanel.hidden = false;
    } catch (e) {
        console.error(e);
    }
};

window.addEventListener("load", init);
