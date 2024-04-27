import { Component, Input, OnInit } from '@angular/core';
import { Trip } from '../model/trip';
import { TravelService } from '../service/travels.service';

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [],
  templateUrl: './trip.component.html',
  styleUrl: './trip.component.css'
})
export class TripComponent implements OnInit {
  @Input()
  trip: Trip = { id: "", title: "", background: "", startDate: "", endDate: "", steps: [] };

  tripDates: string[] = [];
  tripLength: string[] = [];
  picture: string = "";

  constructor(private service: TravelService) {}

  ngOnInit(): void {
    this.tripDates = this.service.humanizeYearAndMonth(this.trip.startDate).split(" ");
    this.tripLength = this.service.humanizeTripDuration(this.trip.startDate, this.trip.endDate);
    this.picture = this.service.getPictureURL(this.trip.background);
  }
}
