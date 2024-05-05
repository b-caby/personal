import { Injectable } from "@angular/core";
import { AddLayerObject, GeoJSONSourceSpecification, LngLatBounds, Map, Marker } from "maplibre-gl";
import { environment } from "../../../environments/environment";
import { Trip } from "../model/trip";
import { Position } from "geojson";
import { Step } from "../model/step";

@Injectable()
export class MapHelper {
  public map!: Map;
  private readonly dimmedClass: string = "is-dimmed";

  public initializeMap(element: HTMLElement) {
    this.map = new Map({
      container: element,
      style: `https://api.maptiler.com/maps/satellite/style.json?key=${environment.mapToken}`,
      center: [0, 0],
      zoom: 1
    });

    return this.map;
  }

  public fitBounds(coordinates: any[]) {
    this.map.resize();
    this.map.fitBounds(this.getBounds(coordinates), { padding: 30, screenSpeed: 6 });
  }

  public flyToPoint(latitude: number, longitude: number, zoom: number) {
    this.map.resize();
    this.map.flyTo({
      center: [latitude, longitude],
      zoom: zoom,
      speed: 4
    });
  }

  public addLine(trip: Trip) {
    this.map.addSource(trip.id, this.createLineSource(trip.steps.map(s => [s.longitude, s.latitude])));
    this.map.addLayer(this.createLineLayer(trip.id));
  }

  public setAllMarkers(trip: Trip, callback: (trip: Trip) => void): Marker[] {
    const markers: Marker[] = [];
    trip.steps.forEach(step => {
      const marker = this.createMarker(trip, step);
      marker.addEventListener("click", () => callback(trip));

      // add marker to map
      var mapMarker = new Marker({ element: marker }).setLngLat([step.longitude, step.latitude]);
      markers.push(mapMarker);
    });

    return markers;
  }

  public setStepMarkers(trip: Trip, callback: (step: Step) => void): Marker[] {
    const markers: Marker[] = [];
    trip.steps.forEach(step => {
      const marker = this.createMarker(trip, step);
      marker.addEventListener("click", () => callback(step));

      // add marker to map
      var mapMarker = new Marker({ element: marker }).setLngLat([step.longitude, step.latitude]);
      markers.push(mapMarker);
    });

    return markers;
  }

  public changeLinesOpacity(trips: Trip[], opacity: number) {
    trips.forEach(t => {
      this.map.setPaintProperty(`${t.id}`, "line-opacity", opacity);
    });
  }

  public highlightMarkers(markers: Marker[]) {
    markers.forEach(marker => {
      marker.removeClassName(this.dimmedClass);
    });
  }

  public dimMarkers(markers: Marker[]) {
    markers.forEach(marker => {
      marker.addClassName(this.dimmedClass);
    });
  }

  public addMarkers(markers: Marker[]) {
    markers.forEach(marker => {
      marker.addTo(this.map);
    });
  }

  public removeMarkers(markers: Marker[]) {
    markers.forEach(marker => {
      marker.remove();
    });
  }

  private createMarker(trip: Trip, step: Step): HTMLDivElement {
    const marker = document.createElement("div");
    const markerContainer = document.createElement("div");
    const image = document.createElement("img");
    marker.append(markerContainer);
    markerContainer.append(image);

    marker.className = "step-marker";
    marker.setAttribute("trip", trip.id);
    markerContainer.className = "step-marker_container";
    image.src = `https://${environment.twicpicAccount}.twic.pics/${environment.twicpicPath}/${step.pictures.at(0)}.jpg`;

    return marker;
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
}