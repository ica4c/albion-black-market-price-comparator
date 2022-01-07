import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Offer} from "../../../domain/offer";

@Component({
  selector: 'cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit {
  @Input() offers: Offer[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
