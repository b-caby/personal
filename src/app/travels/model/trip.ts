import { Step } from "./step";

export interface Trip {
    id: string;
    title: string;
    background: string;
    startDate: string;
    endDate: string;
    steps: Step[];
}