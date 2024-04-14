import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TravelsComponent } from '../travels.component';
import { TravelService } from '../service/travels.service';

describe('ResumeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelsComponent],
      providers: [TravelService, HttpClient, HttpHandler]
    }).compileComponents();
  });

  it('return hunanized duration', () => {
    const fixture = TestBed.createComponent(TravelsComponent);
    const app = fixture.componentInstance;

    expect(app.parseTripDuration("01/02/2021", "10/02/2021")).toEqual("9 days");
    expect(app.parseTripDuration("25/01/2021", "05/02/2021")).toEqual("11 days");
    expect(app.parseTripDuration("01/02/2021", "21/02/2021")).toEqual("20 days");
    expect(app.parseTripDuration("01/02/2021", "10/03/2021")).toEqual("1 month");
    expect(app.parseTripDuration("01/02/2021", "10/05/2021")).toEqual("3 months");
  });

});

