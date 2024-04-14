import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Map } from 'maplibre-gl';
import { TravelService } from './service/travels.service';
import { Trip } from './model/trip';
import moment from 'moment';

@Component({
  selector: 'app-travels',
  standalone: true,
  imports: [],
  templateUrl: './travels.component.html',
  styleUrl: './travels.component.css'
})
export class TravelsComponent implements OnInit, AfterViewInit, OnDestroy {

  private map: Map | undefined;
  public currentTrip: Trip | undefined;
  public trips: Trip[] = [];

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(private service: TravelService) { }

  ngOnInit(): void {
    this.service.fetchTrips()
    .subscribe(data => this.trips = data);
  }

  ngAfterViewInit() {
    const initialState = { lng: 0, lat: 0, zoom: 1 };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: `https://api.maptiler.com/maps/satellite/style.json?key=NpjNfVeEtJfI7OVTDC9i`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });

  }

  ngOnDestroy() {
    this.map?.remove();
  }

  public parseTripDuration(startDate: string, endDate: string): string {
    const startMoment = moment(startDate, "DD/MM/YYYY");
    const endMoment = moment(endDate, "DD/MM/YYYY");

    const numberOfDays = moment.duration(endMoment.diff(startMoment)).asDays();
    return `${moment.duration(numberOfDays, "days").humanize().replace('a ', '1 ').trim()}`;
  }

  public OpenTrip(trip: Trip) {
    this.currentTrip = trip;
  }

  public CloseTrip(){
    this.currentTrip = undefined;
  }
}
