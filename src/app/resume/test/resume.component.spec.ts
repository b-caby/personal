import { TestBed } from '@angular/core/testing';
import { ResumeComponent } from '../resume.component';
import { ResumeService } from '../service/resume.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('ResumeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeComponent],
      providers: [ResumeService, HttpClient, HttpHandler]
    }).compileComponents();
  });

  it('return humanized date', () => {
    const fixture = TestBed.createComponent(ResumeComponent);
    const app = fixture.componentInstance;

    expect(app.parseDate("01/2020")).toEqual("January 2020");
    expect(app.parseDate("05/2020")).toEqual("May 2020");
    expect(app.parseDate("")).toEqual("today");
  });

  it('return hunanized duration', () => {
    const fixture = TestBed.createComponent(ResumeComponent);
    const app = fixture.componentInstance;

    expect(app.parseDuration("02/2021", "03/2021")).toEqual("1 month");
    expect(app.parseDuration("01/2020", "12/2020")).toEqual("11 months");
    expect(app.parseDuration("01/2020", "01/2021")).toEqual("1 year");
    expect(app.parseDuration("01/2020", "02/2022")).toEqual("2 years 1 month");
    expect(app.parseDuration("01/2020", "06/2021")).toEqual("1 year 5 months");
  });

});

