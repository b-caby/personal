import { Component, Input } from '@angular/core';
import { Step } from '../model/step';
import moment from 'moment';
import { TravelService } from '../service/travels.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-step',
  standalone: true,
  imports: [],
  templateUrl: './step.component.html',
  styleUrl: './step.component.css'
})
export class StepComponent {

  @Input()
  step: Step = { title: "", description: "", date: "", latitude: 0, longitude: 0, pictures: [] };

  public country: string = "";
  public countryFlag: string = "";

  constructor(private service: TravelService) {}

  ngOnInit(): void {
    this.service.getCountry(this.step.latitude, this.step.longitude).subscribe(data => {
      this.country = data.address.country;
      this.countryFlag = data.address.country_code;
    });
  }

  public parseStepDate(date: string): string {
    return moment(date, "DD/MM/YYYY").format("D MMMM YYYY");
  }

  public GetURL(picture: string):string {
    return `https://${environment.twicpicAccount}.twic.pics/${environment.twicpicPath}/${picture}.jpg`;
  }
}
