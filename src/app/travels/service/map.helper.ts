import { Injectable } from "@angular/core";
import { Map, LngLatBounds, Marker, GeoJSONSourceSpecification, AddLayerObject } from "maplibre-gl";
import { environment } from "../../../environments/environment";
import { Trip } from "../model/trip";
import { Position } from "geojson";

@Injectable()
export class MapHelper {
    public map!: Map;

    public InitializeMap(element: HTMLElement){
       this.map = new Map({
            container: element,
            style: `https://api.maptiler.com/maps/satellite/style.json?key=${environment.mapToken}`,
            center: [0, 0],
            zoom: 1
          });

          return this.map;
    }

    public FitBounds(coordinates: any[]) {
        this.map.resize();
        this.map.fitBounds(this.getBounds(coordinates), { padding: 30, screenSpeed: 6 });
    }

    public AddLine(trip: Trip) {
        this.map.addSource(trip.id, this.createLineSource(trip.steps.map(s => [s.longitude, s.latitude])));
        this.map.addLayer(this.createLineLayer(trip.id));
    }

    public AddMarkers(trip: Trip) {
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