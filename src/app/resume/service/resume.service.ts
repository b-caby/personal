import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { Job } from "../model/job";

@Injectable()
export class ResumeService {

    constructor(private http: HttpClient) { }
    
    fetchResume(): Observable<Job[]> {
        return this.http.get<Job[]>('assets/resume.json');
    }
}