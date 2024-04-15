import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { AddLayerObject, GeoJSONSourceSpecification, Map } from 'maplibre-gl';
import { TravelService } from './service/travels.service';
import { Trip } from './model/trip';
import { StepComponent } from "./step/step.component";
import { TripComponent } from "./trip/trip.component";
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

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(private service: TravelService) { }

  ngOnInit(): void {
    this.service.fetchTrips().subscribe(data => this.trips = data);
  }

  ngAfterViewInit() {
    const initialState = { lng: 0, lat: 0, zoom: 1 };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: `https://api.maptiler.com/maps/satellite/style.json?key=NpjNfVeEtJfI7OVTDC9i`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });

    this.map.on("load", () => {
      this.trips.forEach(trip => {
        this.map.addSource(trip.title, this.createSource(trip.steps));
        this.map.addLayer(this.createMarkerLayer(trip.title));
        this.map.addLayer(this.createLineLayer(trip.title));
      });
    });
  }

  private createSource(steps: Step[]): GeoJSONSourceSpecification {
    const features: any[] = [];
    const coordinates: any[] = [];

    /* Create the point feature */
    steps.forEach(step => {
      const latLong = [step.longitude, step.latitude]

      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: latLong },
        properties: {}
      });

      coordinates.push(latLong);
    });

    /* Create the line feature */
    features.push({
      type: "Feature",
      geometry: { type: "LineString", coordinates: coordinates },
    });  

    /* Create the feature collection */
    return {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: features
      }
    };
  }

  private createMarkerLayer(source: string): AddLayerObject {
    return {
      id: `marker-${source}`,
      type: "circle",
      source: source,
      paint: {
        "circle-color": "red",
        "circle-radius": 5
      }
    };
  }

  private createLineLayer(source: string): AddLayerObject {
    return {
      id: `line-${source}`,
      type: "line",
      source: source,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": 'red',
        "line-width": 2
    }
    };
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
}
