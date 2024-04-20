import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Map, Marker } from 'maplibre-gl';
import { TravelService } from './service/travels.service';
import { Trip } from './model/trip';
import { StepComponent } from "./step/step.component";
import { TripComponent } from "./trip/trip.component";
import { Position } from 'geojson';
import { MapHelper } from './service/map.helper';
import { Step } from './model/step';

@Component({
  selector: 'app-travels',
  standalone: true,
  templateUrl: './travels.component.html',
  styleUrl: './travels.component.css',
  imports: [StepComponent, TripComponent]
})
export class TravelsComponent implements OnInit, AfterViewInit, OnDestroy {

  private map!: Map;
  public currentTrip: Trip | undefined;
  public trips: Trip[] = [];
  public coordinates: Position[] = [];
  public markers: Marker[] = [];
  public currentMarkers: Marker[] = [];

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(private service: TravelService, private helper: MapHelper) { }

  ngOnInit(): void {
    this.service.fetchTrips().subscribe(data => {
      this.trips = data;
      this.coordinates = data.flatMap(t => t.steps.map(s => [s.longitude, s.latitude]));
    });
  }

  ngAfterViewInit() {
    this.map = this.helper.initializeMap(this.mapContainer.nativeElement);

    this.map.on("load", () => {
      this.trips.forEach(trip => {
        this.markers = this.markers.concat(this.helper.setAllMarkers(trip, (e) => { this.OpenTrip(e); }));
        this.helper.addLine(trip);
      });

      this.helper.addMarkers(this.markers);
      this.helper.fitBounds(this.coordinates);
    });
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  public OpenTrip(trip: Trip) {
    this.currentTrip = trip;

    this.helper.changeLinesOpacity(this.trips.filter(t => t !== trip), 0);
    this.helper.removeMarkers(this.markers);
    this.currentMarkers = this.helper.setStepMarkers(trip, (e: Step) => { console.log(e.title) });

    setTimeout(() => {
      this.helper.fitBounds(trip.steps.map(s => [s.longitude, s.latitude]));
      this.helper.addMarkers(this.currentMarkers);
      this.helper.highlightMarkers(this.currentMarkers);
    }, 100);
  }

  public CloseTrip() {
    this.currentTrip = undefined;
    this.helper.removeMarkers(this.currentMarkers);

    setTimeout(() => { 
      this.helper.fitBounds(this.coordinates);
      this.helper.changeLinesOpacity(this.trips, 1);
      this.helper.addMarkers(this.markers);
      this.helper.highlightMarkers(this.markers);
    }, 100);
  }

  public OnMouseEnterTrip(trip: Trip) {
    this.helper.fitBounds(this.coordinates);
    this.helper.changeLinesOpacity(this.trips.filter(t => t !== trip), 0.2);
    this.helper.dimMarkers(this.markers.filter(m => m._element.getAttribute("trip") !== trip.id));
  }

  public OnMouseLeaveTrip() {
    this.helper.fitBounds(this.coordinates);
    this.helper.changeLinesOpacity(this.trips, 1);
    this.helper.highlightMarkers(this.markers);
  }
}
