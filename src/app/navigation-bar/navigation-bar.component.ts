import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'navigation-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.css'
})
export class NavigationBarComponent {
  public toggled: boolean = false;
  public Toggle = () => this.toggled = !this.toggled;
  public items = [
      { title: "ABOUT ME", hyperlink: "home" },
      { title: "RESUME", hyperlink: "resume" },
      { title: "TRAVELS", hyperlink: "travels" },
  ];

}
