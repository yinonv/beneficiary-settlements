import { MapService } from "../services/map.service";
import {
    BeneficiarySettlement,
    dataByYear,
    indexToGroup,
    Ranges,
    Year
} from "../data/beneficiary-settlement";
import GreenMarkerIcon from "/green_MarkerA.png";
import BlueMarkerIcon from "/blue_MarkerB.png";
import YellowMarkerIcon from "/yellow_MarkerC.png";
import OrangeMarkerIcon from "/orange_MarkerD.png";
import RedMarkerIcon from "/red_MarkerE.png";

// Types
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

// UI Component
class LayoutUI {
    private elements: HtmlElements;
    private numFormatter: Intl.NumberFormat;

    constructor() {
        this.elements = this.getHtmlElements();
        this.numFormatter = new Intl.NumberFormat("he-IL", {
            maximumSignificantDigits: 5
        });
    }

    private getHtmlElements(): HtmlElements {
        return {
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
    }

    public init(): void {
        this.addListeners();
        this.elements.sidePanel.hidden = false;
    }

    private addListeners(): void {
        this.elements.year.addEventListener(
            "change",
            this.onYearChange.bind(this)
        );
        this.elements.legendBtn.addEventListener(
            "click",
            this.onLegendClick.bind(this)
        );
        this.elements.sidePanelCloseBtn.addEventListener(
            "click",
            this.onCloseLegendClick.bind(this)
        );
        this.elements.checkboxes.forEach((cb) => {
            cb.addEventListener("click", this.onCheckboxClick.bind(this));
        });
    }

    public setSidePanelText(year: Year, ranges: Ranges): void {
        this.elements.legendTitle.textContent = `Max Tax Return (${year})`;
        this.elements.taxRanges.forEach((tr, i) => {
            const target = tr as HTMLImageElement;
            // @ts-ignore
            const range = ranges[indexToGroup[String(i)]];
            const min = this.numFormatter.format(range.min);
            const max = this.numFormatter.format(range.max);
            target.textContent =
                range.min == range.max ? `${max}₪` : `${min}₪ - ${max}₪`;
        });
    }

    public getCurrentYear(): Year {
        return (this.elements.year as HTMLSelectElement).value as Year;
    }

    public getCheckboxValues(): { [key: string]: boolean } {
        const values: { [key: string]: boolean } = {};
        this.elements.checkboxes.forEach((cb) => {
            values[cb.value] = cb.checked;
        });
        return values;
    }

    private onYearChange(e: Event): void {
        const target = e?.target as HTMLSelectElement;
        const year = target.value as Year;
        this.onYearChangeCallback?.(year);
    }

    private onLegendClick(): void {
        this.elements.legendBtn.hidden = true;
        this.elements.sidePanel.hidden = false;
    }

    private onCloseLegendClick(): void {
        this.elements.sidePanel.hidden = true;
        this.elements.legendBtn.hidden = false;
    }

    private onCheckboxClick(e: Event): void {
        const target = e?.target as HTMLInputElement;
        const label = target.value as keyof typeof MarkerIcons;
        this.onCheckboxChangeCallback?.(label, target.checked);
    }

    // Callbacks
    private onYearChangeCallback: ((year: Year) => void) | null = null;
    private onCheckboxChangeCallback:
        | ((label: string, checked: boolean) => void)
        | null = null;

    public setOnYearChange(callback: (year: Year) => void): void {
        this.onYearChangeCallback = callback;
    }

    public setOnCheckboxChange(
        callback: (label: string, checked: boolean) => void
    ): void {
        this.onCheckboxChangeCallback = callback;
    }
}

// Main Layout Component
export class Layout {
    private ui: LayoutUI;

    constructor(private readonly mapService: MapService) {
        this.ui = new LayoutUI();
    }

    public init(): void {
        this.ui.init();
        this.ui.setOnYearChange(this.onYearChange.bind(this));
        this.ui.setOnCheckboxChange(this.onCheckboxChange.bind(this));
        this.drawMap(DEFAULT_YEAR);
    }

    private drawMap(year: Year): void {
        this.mapService.clearMarkers();
        const { data, ranges } = dataByYear[year];
        this.ui.setSidePanelText(year, ranges);
        this.addSettlements(data, ranges);
    }

    private addSettlements(
        data: BeneficiarySettlement[],
        ranges: Ranges
    ): void {
        for (const bs of data) {
            const maxTaxReturn = Math.floor((bs.maxIncome * bs.percent) / 100);
            const maxTaxReturnFormatted = `${this.ui["numFormatter"].format(maxTaxReturn)}₪`;
            const text = `<div class="marker-text" dir="rtl">${bs.name}</div><div dir="rtl">${maxTaxReturnFormatted}</div>`;
            bs.label = this.getMarkerLabel(maxTaxReturn, ranges);
            this.mapService.addMarker(
                bs.coordinates,
                MarkerIcons[bs.label],
                maxTaxReturnFormatted,
                text
            );
        }
        // keep existing filters
        const checkboxValues = this.ui.getCheckboxValues();
        Object.entries(checkboxValues).forEach(([label, checked]) => {
            if (!checked) {
                this.mapService.hideMarkers(
                    MarkerIcons[label as keyof typeof MarkerIcons]
                );
            }
        });
    }

    private onYearChange(year: Year): void {
        this.drawMap(year);
    }

    private onCheckboxChange(label: string, checked: boolean): void {
        if (checked) {
            this.mapService.showMarkers(
                MarkerIcons[label as keyof typeof MarkerIcons]
            );
            return;
        }
        this.mapService.hideMarkers(
            MarkerIcons[label as keyof typeof MarkerIcons]
        );
    }

    private getMarkerLabel(
        maxTaxReturn: number,
        ranges: Ranges
    ): keyof typeof MarkerIcons {
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
