import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Map } from 'maplibre-gl';
import { TravelService } from './service/travels.service';
import { Trip } from './model/trip';
import { StepComponent } from "./step/step.component";
import { TripComponent } from "./trip/trip.component";
import { Position } from 'geojson';
import { MapHelper } from './service/map.helper';

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
  private readonly dimmedClass: string = "is-dimmed";

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
    this.map = this.helper.InitializeMap(this.mapContainer.nativeElement);

    this.map.on("load", () => {
      this.trips.forEach(trip => {
        this.helper.AddLine(trip);
        this.helper.AddMarkers(trip);
      });

      this.helper.FitBounds(this.coordinates);
    });
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  public OpenTrip(trip: Trip) {
    this.currentTrip = trip;
    setTimeout(() => { this.helper.FitBounds(trip.steps.map(s => [s.longitude, s.latitude])) }, 100);
  }

  public CloseTrip() {
    this.currentTrip = undefined;
    setTimeout(() => { this.helper.FitBounds(this.coordinates) }, 100);
  }

  public OnMouseEnterTrip(trip: Trip) {
    this.helper.FitBounds(this.coordinates);

    this.trips.forEach(t => {
      if (t !== trip) {
        this.map.setPaintProperty(`${t.id}`, "line-opacity", 0.2);
      }
    });

    document.querySelectorAll(".step-marker").forEach(element => {
      if (element.getAttribute("trip") !== trip.id) {
        element.classList.add(this.dimmedClass);
      }
    });
  }

  public OnMouseLeaveTrip() {
    this.helper.FitBounds(this.coordinates);

    this.trips.forEach(t => {
      this.map.setPaintProperty(`${t.id}`, "line-opacity", 1);
    });

    document.querySelectorAll(".step-marker").forEach(element => {
      element.classList.remove(this.dimmedClass);
    });
  }
}
