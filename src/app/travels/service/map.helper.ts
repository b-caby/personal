import { Injectable } from "@angular/core";
import { AddLayerObject, GeoJSONSourceSpecification, LngLatBounds, Map, Marker } from "maplibre-gl";
import { environment } from "../../../environments/environment";
import { Trip } from "../model/trip";
import { Feature, GeoJsonProperties, Geometry, Position } from "geojson";
import { Step } from "../model/step";

@Injectable()
export class MapHelper {
  public map!: Map;
  private readonly dimmedClass: string = "is-dimmed";
  private markers: Marker[] = [];
  private markersOnScreen: { [id: string]: Marker } = {};

  public initializeMap(element: HTMLElement) {
    this.map = new Map({
      container: element,
      style: `https://api.maptiler.com/maps/satellite/style.json?key=${environment.mapToken}`,
      center: [0, 0],
      zoom: 1
    });

    return this.map;
  }

  /* Map movement */
  private getBounds(coordinates: any[]) {
    return coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new LngLatBounds(coordinates[0], coordinates[0]));
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

  /* Line management */

  public addLine(trip: Trip) {
    this.map.addSource(`line_${trip.id}`, this.createLineSource(trip.steps.map(s => [s.longitude, s.latitude])));
    this.map.addLayer(this.createLineLayer(`line_${trip.id}`));
  }

  public changeLinesOpacity(trips: Trip[], opacity: number) {
    trips.forEach(t => {
      this.map.setPaintProperty(`line_${t.id}`, "line-opacity", opacity);
    });
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
      id: source,
      type: "line",
      source: source,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "white",
        "line-width": 2
      }
    };
  }

  /* Marker management */

  public addCluster(trips: Trip[]) {
    this.map.addSource("clusters", this.createClusterSource(trips));
    this.map.addLayer(this.createPointLayer("clusters"));
  }

  public createClusterSource(trips: Trip[]): GeoJSONSourceSpecification {
    const features: Feature<Geometry, GeoJsonProperties>[] = [];

    trips.forEach(trip => {
      trip.steps.forEach((step, index) => {
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [step.longitude, step.latitude] },
          properties: { trip: trip.id, step: index, longitude: step.longitude, latitude: step.latitude }
        })
      })
    });

    return {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: features
      },
      cluster: true,
      clusterRadius: 5,
      clusterProperties: {
        trip: ["min", ["get", "trip"]],
        step: ["min", ["get", "step"]]
      }
    }
  }

  private createPointLayer(source: string): AddLayerObject {
    return {
      id: source,
      type: "circle",
      source: source,
      paint: {
        "circle-color": "white",
        "circle-radius": 0
      }
    };
  }

  public highlightMarkers() {
    this.markers.forEach(marker => {
      marker.removeClassName(this.dimmedClass);
    });
  }

  public dimMarkers(trip: Trip) {
    const markersToDim = this.markers.filter(m => m._element.getAttribute("trip") !== trip.id.toString());
    markersToDim.forEach(marker => {
      marker.addClassName(this.dimmedClass);
    });
  }

  private createMarker(tripId: string, picture: string, clusterNumber?: number): HTMLDivElement {
    const marker = document.createElement("div");
    const markerContainer = document.createElement("div");
    const image = document.createElement("img");
    marker.append(markerContainer);
    markerContainer.append(image);

    marker.className = "step-marker";
    marker.setAttribute("trip", tripId);
    markerContainer.className = "step-marker_container";
    image.src = `https://${environment.twicpicAccount}.twic.pics/${environment.twicpicPath}/${picture}.jpg`;

    if (!!clusterNumber) {
      const clusterContainer = document.createElement("div");
      clusterContainer.innerHTML = clusterNumber.toString();
      clusterContainer.className = "step-marker_cluster";
      marker.append(clusterContainer);
    }

    return marker;
  }

  public updateMarkers(trips: Trip[], callback: (argTrip: Trip, argStep: Step) => void, currentTrip?: Trip) {
    const newMarkers: { [id: string]: Marker } = {};
    const features: any[] = this.map.querySourceFeatures("clusters");

    features.forEach(feature => {
      const props = feature.properties;
      const tripId = props.trip;
      const stepId = props.step;

      const coord = !!props.cluster ? feature.geometry.coordinates : [props.longitude, props.latitude];
      const id = !!props.cluster ? props["cluster_id"] : ((tripId + stepId) * (tripId + stepId + 1) / 2) + stepId;

      if (!currentTrip || currentTrip.id === tripId) {
        let marker = this.markers[id];
        if (!marker) {
          const trip = trips.find(trip => trip.id === props.trip);
          if (!trip) return;
          const step = trip.steps.at(stepId);
          if (!step) return;

          const clusterMarker = this.createMarker(tripId, step.pictures.at(0)!, props["point_count_abbreviated"]);
          clusterMarker.addEventListener("click", () => callback(trip,step));
          marker = this.markers[id] = new Marker({ element: clusterMarker }).setLngLat(coord);
        }

        newMarkers[id] = marker;

        if (!this.markersOnScreen[id]) {
          marker.addTo(this.map);
        }
      }
    });

    for (const id in this.markersOnScreen) {
      if (!newMarkers[id]) {
        this.markersOnScreen[id].remove();
      }
    }

    this.markersOnScreen = newMarkers;
  }
}