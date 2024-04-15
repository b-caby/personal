import { Job } from "./job";

export interface GroupedJob {
    key: string;
    values: Job[];
}