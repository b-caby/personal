import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { Injectable } from "@angular/core";
import { Trip } from "../model/trip";
import { CountryDTO } from "../model/countryDTO";

@Injectable()
export class TravelService {

    private countryURL = (latitude: number, longitude: number): string => `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    constructor(private http: HttpClient) { }
    
    fetchTrips(): Observable<Trip[]> {
        return this.http.get<Trip[]>('assets/travels.json');
    }

    getCountry(latitude: number, longitude: number): Observable<CountryDTO> {
        return this.http.get<CountryDTO>(this.countryURL(latitude, longitude));
    }
}