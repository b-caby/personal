import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { Injectable } from "@angular/core";
import { Job } from "../model/job";
import { GroupedJob } from "../model/groupedJob";

@Injectable()
export class ResumeService {

    constructor(private http: HttpClient) { }
    
    fetchResume(): Observable<GroupedJob[]> {
        return this.http.get<Job[]>('assets/resume.json').pipe(map(res => {
            return this.groupByCompany(res);
        }));
    }

    private groupByCompany(array: Job[]): GroupedJob[] {
        return array.reduce((all: GroupedJob[], current: Job) => {
            const existingKey = all.find(group => group.key === current.company);
            if (!existingKey) {
                all.push({key: current.company, values: [current]});
            } else {
                existingKey.values.push(current);
            }
            return all;
        }, []);
    }   
}