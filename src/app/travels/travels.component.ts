import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Map, Marker } from 'maplibre-gl';
import { TravelService } from './service/travels.service';
import { Trip } from './model/trip';
import { StepComponent } from "./step/step.component";
import { TripComponent } from "./trip/trip.component";
import { Position } from 'geojson';
import { MapHelper } from './service/map.helper';
import { Step } from './model/step';
import { StepContainerComponent } from "./step-container/step-container.component";

@Component({
    selector: 'app-travels',
    standalone: true,
    templateUrl: './travels.component.html',
    styleUrl: './travels.component.css',
    imports: [StepComponent, TripComponent, StepContainerComponent]
})
export class TravelsComponent implements OnInit, AfterViewInit, OnDestroy {

  private map!: Map;
  private isMapInitialized: boolean = false;
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
        this.markers = this.markers.concat(this.helper.setAllMarkers(trip, (e) => { this.openTrip(e); }));
        this.helper.addLine(trip);
      });

      this.helper.addMarkers(this.markers);
      this.helper.fitBounds(this.coordinates);
      this.isMapInitialized = true;
    });
  }

  ngOnDestroy() {
    this.map.remove();
  }

  public openTrip(trip: Trip) {
    if (this.isMapInitialized === true) {

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
  }

  public closeTrip() {
    this.currentTrip = undefined;
    this.helper.removeMarkers(this.currentMarkers);

    setTimeout(() => {
      this.helper.fitBounds(this.coordinates);
      this.helper.changeLinesOpacity(this.trips, 1);
      this.helper.addMarkers(this.markers);
      this.helper.highlightMarkers(this.markers);
    }, 100);
  }

  public onMouseEnterTrip(trip: Trip) {
    if (this.isMapInitialized === true) {
      this.helper.fitBounds(this.coordinates);
      this.helper.changeLinesOpacity(this.trips.filter(t => t !== trip), 0.2);
      this.helper.dimMarkers(this.markers.filter(m => m._element.getAttribute("trip") !== trip.id));
    }
  }

  public onMouseLeaveTrip() {
    if (this.isMapInitialized === true) {
      this.helper.fitBounds(this.coordinates);
      this.helper.changeLinesOpacity(this.trips, 1);
      this.helper.highlightMarkers(this.markers);
    }
  }
}
