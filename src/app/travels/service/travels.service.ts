import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { Trip } from "../model/trip";

@Injectable()
export class TravelService {

    constructor(private http: HttpClient) { }
    
    fetchTrips(): Observable<Trip[]> {
        return this.http.get<Trip[]>('assets/travels.json');
    }
}