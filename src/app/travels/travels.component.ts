import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { AddLayerObject, GeoJSONSourceSpecification, LngLatBounds, Map, Marker } from 'maplibre-gl';
import { TravelService } from './service/travels.service';
import { Trip } from './model/trip';
import { StepComponent } from "./step/step.component";
import { TripComponent } from "./trip/trip.component";
import { environment } from "../../environments/environment";
import { Position } from 'geojson';

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

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(private service: TravelService) { }

  ngOnInit(): void {
    this.service.fetchTrips().subscribe(data => this.trips = data);
  }

  ngAfterViewInit() {
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: `https://api.maptiler.com/maps/satellite/style.json?key=${environment.mapToken}`,
      center: [0, 0],
      zoom: 1
    });

    this.map.on("load", () => {
      this.coordinates = this.trips.flatMap(t => t.steps.map(s => [s.longitude, s.latitude]));
      this.trips.forEach(trip => {
        this.map.addSource(trip.id, this.createLineSource(trip.steps.map(s => [s.longitude, s.latitude])));
        this.map.addLayer(this.createLineLayer(trip.id));
        this.AddMarkers(trip);
      });

      this.map.fitBounds(this.getBounds(this.coordinates), { padding: 30 });
    });
  }

  private getBounds(coordinates: any[]) {
    return coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new LngLatBounds(coordinates[0], coordinates[0]));
  }

  private createLineSource(coordinates: Position[]): GeoJSONSourceSpecification {
    return {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "LineString", coordinates: coordinates },
            properties: {}
          }
        ]
      }
    };
  }

  private createLineLayer(source: string): AddLayerObject {
    return {
      id: `${source}`,
      type: "line",
      source: source,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": 'white',
        "line-width": 2
      }
    };
  }

  private AddMarkers(trip: Trip) {
    trip.steps.forEach(step => {
      const marker = document.createElement("div");
      const markerContainer = document.createElement("div");
      const image = document.createElement("img");
      marker.append(markerContainer);
      markerContainer.append(image);

      marker.className = "step-marker";
      marker.setAttribute("trip", trip.id);
      markerContainer.className = "step-marker_container";
      image.src = `https://${environment.twicpicAccount}.twic.pics/${environment.twicpicPath}/${step.pictures.at(0)}.jpg`;

      // add marker to map
      new Marker({ element: marker })
        .setLngLat([step.longitude, step.latitude])
        .addTo(this.map);
    });
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  public OpenTrip(trip: Trip) {
    this.currentTrip = trip;
  }

  public CloseTrip() {
    this.currentTrip = undefined;
  }

  public OnMouseEnterTrip(trip: Trip) {
    this.map.fitBounds(this.getBounds(this.coordinates), { padding: 30 });

    this.trips.forEach(t => {
      if (t !== trip) {
        this.map.setPaintProperty(`${t.id}`, "line-opacity", 0.2);
      }
    });

    document.querySelectorAll(".step-marker").forEach(element => {
      if (element.getAttribute("trip") !== trip.id) {
        element.classList.add("is-dimmed");
      }
    });
  }

  public OnMouseLeaveTrip() {
    this.map.fitBounds(this.getBounds(this.coordinates), { padding: 30 });

    this.trips.forEach(t => {
      this.map.setPaintProperty(`${t.id}`, "line-opacity", 1);
    });

    document.querySelectorAll(".step-marker").forEach(element => {
      element.classList.remove("is-dimmed");
    });
  }
}
