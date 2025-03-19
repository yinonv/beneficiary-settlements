import { MapService } from "./map.service";
import {
    BeneficiarySettlement,
    dataByYear,
    indexToGroup,
    Ranges,
    Year
} from "./data/beneficiary-settlement";
import GreenMarkerIcon from "/green_MarkerA.png";
import BlueMarkerIcon from "/blue_MarkerB.png";
import YellowMarkerIcon from "/yellow_MarkerC.png";
import OrangeMarkerIcon from "/orange_MarkerD.png";
import RedMarkerIcon from "/red_MarkerE.png";

type HtmlElements = {
    sidePanel: HTMLElement;
    legendBtn: HTMLElement;
    legendTitle: HTMLElement;
    sidePanelCloseBtn: HTMLElement;
    year: HTMLElement;
    taxRanges: NodeListOf<HTMLElement>;
    checkboxes: NodeListOf<HTMLInputElement>;
};

const DEFAULT_YEAR = "2025" as Year;

const MarkerIcons = {
    A: GreenMarkerIcon,
    B: BlueMarkerIcon,
    C: YellowMarkerIcon,
    D: OrangeMarkerIcon,
    E: RedMarkerIcon
};

export class Layout {
    private htmlElements: HtmlElements;
    private numFormatter: Intl.NumberFormat;

    constructor(private readonly mapService: MapService) {
        this.htmlElements = {
            sidePanel: document.getElementById("side-panel") as HTMLElement,
            legendBtn: document.getElementById("legend") as HTMLElement,
            legendTitle: document.querySelector(
                '[type="tax-return-title"]'
            ) as HTMLElement,
            taxRanges: document.querySelectorAll(
                '[type="tax-return"]'
            ) as NodeListOf<HTMLElement>,
            checkboxes: document.querySelectorAll(
                "input"
            ) as NodeListOf<HTMLInputElement>,
            sidePanelCloseBtn: document.getElementById(
                "side-panel-close-btn"
            ) as HTMLElement,
            year: document.getElementById("year") as HTMLElement
        };
        this.numFormatter = new Intl.NumberFormat("he-IL", {
            maximumSignificantDigits: 5
        });
    }

    public init() {
        this.addListeners();
        this.drawMap(DEFAULT_YEAR);
        this.htmlElements.sidePanel.hidden = false;
    }

    private addListeners() {
        this.htmlElements.year.addEventListener(
            "change",
            this.onYearChange.bind(this)
        );
        this.htmlElements.legendBtn.addEventListener(
            "click",
            this.onLegendClick.bind(this)
        );
        this.htmlElements.sidePanelCloseBtn.addEventListener(
            "click",
            this.onCloseLegendClick.bind(this)
        );
        this.htmlElements.checkboxes.forEach((cb) => {
            cb.addEventListener("click", this.onCheckboxClick.bind(this));
        });
    }

    private drawMap(year: Year) {
        this.mapService.clearMarkers();
        const { data, ranges } = dataByYear[year];
        this.setSidePanelText(year, ranges);
        this.addSettlements(data, ranges);
    }

    private addSettlements(data: BeneficiarySettlement[], ranges: Ranges) {
        for (const bs of data) {
            const maxTaxReturn = Math.floor((bs.maxIncome * bs.percent) / 100);
            const maxTaxReturnFormatted = `${this.numFormatter.format(maxTaxReturn)}₪`;
            const text = `<div class="marker-text" dir="rtl">${bs.name}</div><div dir="rtl">${maxTaxReturnFormatted}</div>`
            bs.label = this.getMarkerLabel(maxTaxReturn, ranges);
            this.mapService.addMarker(
                bs.coordinates,
                MarkerIcons[bs.label],
                maxTaxReturnFormatted,
                text
            );
        }
        // keep existing filters
        this.htmlElements.checkboxes.forEach((cb) => {
            if (!cb.checked) {
                this.mapService.hideMarkers(cb.value);
            }
        });
    }

    private setSidePanelText(year: Year, ranges: Ranges) {
        this.htmlElements.legendTitle.textContent = `Max Tax Return (${year})`;
        this.htmlElements.taxRanges.forEach((tr, i) => {
            const target = tr as HTMLImageElement;
            // @ts-ignore
            const range = ranges[indexToGroup[String(i)]];
            const min = this.numFormatter.format(range.min);
            const max = this.numFormatter.format(range.max);
            target.textContent =
                range.min == range.max ? `${max}₪` : `${min}₪ - ${max}₪`;
        });
    }

    private onYearChange(e: Event) {
        const target = e?.target as HTMLSelectElement;
        const year = target.value as Year;
        this.drawMap(year);
    }

    private onLegendClick() {
        this.htmlElements.legendBtn.hidden = true;
        this.htmlElements.sidePanel.hidden = false;
    }

    private onCloseLegendClick() {
        this.htmlElements.sidePanel.hidden = true;
        this.htmlElements.legendBtn.hidden = false;
    }

    private onCheckboxClick(e: Event) {
        const target = e?.target as HTMLInputElement;
        const label = target.value as keyof typeof MarkerIcons;
        if (target.checked) {
            this.mapService.showMarkers(MarkerIcons[label]);
        } else {
            this.mapService.hideMarkers(MarkerIcons[label]);
        }
    }

    private getMarkerLabel(maxTaxReturn: number, ranges: Ranges) {
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
    }
}
