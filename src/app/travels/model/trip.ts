import { Step } from "./step";

export interface Trip {
    title: string;
    background: string;
    startDate: string;
    endDate: string;
    steps: Step[];
}