import { Component, Input } from '@angular/core';
import { Trip } from '../model/trip';
import moment from 'moment';
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [],
  templateUrl: './trip.component.html',
  styleUrl: './trip.component.css'
})
export class TripComponent {
  @Input()
  trip: Trip = { id: "", title: "", background: "", startDate: "", endDate: "", steps: [] };


  public parseTripDuration(startDate: string, endDate: string): string[] {
    const startMoment = moment(startDate, "DD/MM/YYYY");
    const endMoment = moment(endDate, "DD/MM/YYYY");

    const numberOfDays = moment.duration(endMoment.diff(startMoment)).asDays();
    return moment.duration(numberOfDays, "days").humanize().replace('a ', '1 ').trim().split(" ");
  }

  public parseTripYear(startDate: string): string {
    return moment(startDate, "DD/MM/YYYY").format("YYYY");
  }

  public parseTripMonth(startDate: string): string {
    return moment(startDate, "DD/MM/YYYY").format("MMMM");
  }

  public GetURL(trip: Trip):string {
    return `https://${environment.twicpicAccount}.twic.pics/${environment.twicpicPath}/${trip.background}.jpg`;
  }
}
