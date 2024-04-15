import { Component, OnInit } from '@angular/core';
import { ResumeService } from './service/resume.service';
import { GroupedJob } from './model/groupedJob';
import moment from 'moment';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.css'
})

export class ResumeComponent implements OnInit {
  public jobs: GroupedJob[]= [];

  constructor(private service: ResumeService) { 
  }

  ngOnInit(): void {
    this.service.fetchResume().subscribe(data => this.jobs = data);
  }

  public parseDuration(startDate: string | undefined, endDate: string | undefined): string {
    const startMoment = moment(startDate, "MM/YYYY");
    const endMoment = moment(endDate, "MM/YYYY");
    const duration = endMoment.isValid() ? endMoment.diff(startMoment) : moment().diff(startMoment);

    const numberOfDays = moment.duration(duration).asDays();
    const numberOfYears = Math.floor(numberOfDays / 365);
    const numberOfMonths = Math.round((numberOfDays - numberOfYears * 365) / 30.4);

    const yearText = numberOfYears > 0 ? numberOfYears > 1 ? `${numberOfYears} years` : `${numberOfYears} year` : "";
    const monthText = numberOfMonths > 0 ? numberOfMonths > 1 ? `${numberOfMonths} months` : `${numberOfMonths} month` : "";
  
    return `${yearText} ${monthText}`.trim();
  }

  public parseDate(date: string): string {
    const formatDate = moment(date, "MM/YYYY");
    return formatDate.isValid() ? formatDate.format("MMMM YYYY") : "today";
  }
}
