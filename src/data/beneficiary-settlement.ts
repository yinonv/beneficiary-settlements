import { beneficiarySettlements2022, ranges2022 } from "./2022";
import { beneficiarySettlements2023, ranges2023 } from "./2023";
import { beneficiarySettlements2024, ranges2024 } from "./2024";
import { beneficiarySettlements2025, ranges2025 } from "./2025";

export type BeneficiarySettlement = {
    maxIncome: number;
    percent: number;
    name: string;
    coordinates: { lng: number; lat: number };
    label?: "A" | "B" | "C" | "D" | "E";
};
type Range = { min: number; max: number };
export type Ranges = {
    A: Range;
    B: Range;
    C: Range;
    D: Range;
    E: Range;
};
export type Year = "2022" | "2023" | "2024" | "2025";

type DataByYear = {
    [key in Year]: { data: BeneficiarySettlement[]; ranges: Ranges };
};
export const dataByYear: DataByYear = {
    2022: {
        data: beneficiarySettlements2022,
        ranges: ranges2022
    },
    2023: {
        data: beneficiarySettlements2023,
        ranges: ranges2023
    },
    2024: {
        data: beneficiarySettlements2024,
        ranges: ranges2024
    },
    2025: {
        data: beneficiarySettlements2025,
        ranges: ranges2025
    }
};

export const indexToGroup = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
    4: "E"
};
