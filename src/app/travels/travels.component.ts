import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Map } from 'maplibre-gl';
import { TravelService } from './service/travels.service';
import { Trip } from './model/trip';
import { StepComponent } from "./step/step.component";
import { TripComponent } from "./trip/trip.component";
import { Position } from 'geojson';
import { MapHelper } from './service/map.helper';
import { StepContainerComponent } from "./step-container/step-container.component";
import { Step } from './model/step';

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
      this.helper.addCluster(this.trips);
      this.trips.forEach(trip => {
        this.helper.addLine(trip);
      });

      this.map.on("data", (e: any) => {
        if (e.sourceId !== "clusters" || !e.isSourceLoaded) return;

        this.map.on("move", () => this.helper.updateMarkers(this.trips, (t, s) => this.onMarkerClicked(t, s), (t) => this.onMouseEnterTrip(t), () => this.onMouseLeaveTrip(), this.currentTrip));
        this.map.on("moveend", () => this.helper.updateMarkers(this.trips, (t, s) => this.onMarkerClicked(t, s), (t) => this.onMouseEnterTrip(t), () => this.onMouseLeaveTrip(), this.currentTrip));
        this.helper.updateMarkers(this.trips, (t, s) => this.onMarkerClicked(t, s), (t) => this.onMouseEnterTrip(t), () => this.onMouseLeaveTrip(),this.currentTrip);
      });

      this.helper.fitBounds(this.coordinates);
      this.isMapInitialized = true;
    });
  }

  ngOnDestroy() {
    this.map.remove();
  }

  public onMarkerClicked(trip: Trip, step: Step) {
    if (this.isMapInitialized) {
      if (!this.currentTrip) {
        this.openTrip(trip);
      }
      else {
        const clickedTrip = this.trips.find(t => t === trip);
        const clickedStep = clickedTrip?.steps.findIndex(s => s === step);
        this.scrollToTop(`step-${clickedStep}`);
      }
    }
  }

  public scrollToTop(elementId: string) {
    const element = document.getElementById(elementId);
    element!.scrollIntoView({
        behavior: "auto",
        block: "start",
        inline: "nearest"
    });
}

  public openTrip(trip: Trip) {
    if (this.isMapInitialized) {
      this.currentTrip = trip;
      this.helper.changeLinesOpacity(this.trips.filter(t => t !== trip), 0);

      setTimeout(() => {
        this.helper.fitBounds(trip.steps.map(s => [s.longitude, s.latitude]));
      }, 100);
    }
  }

  public closeTrip() {
    this.currentTrip = undefined;
    this.helper.changeLinesOpacity(this.trips, 1);
    this.helper.highlightMarkers();

    setTimeout(() => {
      this.helper.fitBounds(this.coordinates);
    }, 100);
  }

  public onMouseEnterTrip(trip: Trip) {
    if (this.isMapInitialized && !this.currentTrip) {
      this.helper.fitBounds(this.coordinates);
      this.helper.changeLinesOpacity(this.trips.filter(t => t !== trip), 0.2);
      this.helper.dimMarkers(trip);
    }
  }

  public onMouseLeaveTrip() {
    if (this.isMapInitialized && !this.currentTrip) {
      this.helper.fitBounds(this.coordinates);
      this.helper.changeLinesOpacity(this.trips, 1);
      this.helper.highlightMarkers();
    }
  }
}
