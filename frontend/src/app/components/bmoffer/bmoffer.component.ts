import {Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import {ItemQuality, Offer} from "../../../domain/offer";
import {Location} from "../../../domain/location";
import {Price} from "../../../domain/priceSet";

@Component({
  selector: 'bm-offer',
  templateUrl: './bmoffer.component.html',
  styleUrls: ['./bmoffer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BMOfferComponent {
  @Input() offer: Offer = {} as Offer;
  @Input() price?: { [key: string]: { [quality: number]: Price } };
  @Input() locations: Location[] = [];
  @Input() isLoading: boolean = false;

  randAmount: number[] = [];

  constructor() {
    this.randAmount = Array(Math.floor(Math.random() * (5 - 1) + 1)).map((_, i) => i)
  }


  resolveIconUrl(itemId: string, quality: ItemQuality) {
    return `https://render.albiononline.com/v1/item/${itemId}.png?quality=${quality}`;
  }

  getPrices(location: Location, quality: ItemQuality) {
    if(this.price && this.price.hasOwnProperty(location)) {
      if(this.price[location].hasOwnProperty(quality)) {
        const price: Price = this.price[location][quality];

        let operands = [price.sell_price_min || 0, price.sell_price_max || 0]
          .filter(i => i > 0);

        if(price.sell_price_min || 0 > 0 || price.sell_price_max || 0 > 0) {
          return {
            min: price.sell_price_min,
            max: price.sell_price_max,
            minAt: price.sell_price_min_date,
            maxAt: price.sell_price_max_date,
            avg: operands.reduce((sum, i) => sum + i, 0) / operands.length
          };
        }
      }
    }

    return null;
  }
}
