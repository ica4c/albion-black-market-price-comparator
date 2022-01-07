import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {filter, fromEvent, map, Observable, of, switchMap, take, tap, throttleTime} from "rxjs";
import {ItemQuality, Offer} from "../../../domain/offer";
import { webSocket } from "rxjs/webSocket";
import {environment} from "../../../environments/environment";
import {ServerCommand} from "../../../domain/serverCommand";
import {Price} from "../../../domain/priceSet";
import {AlbionDataProjectResource} from "../../../services/albionDataProject/albion-data-project.resource";
import {Location} from "../../../domain/location";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {debounce} from "lodash";

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy, OnInit {
  ws$ = webSocket<ServerCommand>(environment.services.wss.host);

  offers$: Observable<Offer[]> = this.ws$
    .pipe(
      filter(e => e.type === 'UPDATE_OFFERS'),
      map(e => e.data as Offer[]),
      tap(_ => window.scrollTo({top: 0, behavior: 'smooth'}))
    );

  filters: any = {
    locations: ['Lymhurst', 'Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Caerleon'] as Location[]
  };

  scrolledEnoughToGoBack: boolean = false;
  isPricesLoading = true;
  prices?: {[itemId: string]: { [location: string]: {[quality: number]: Price}}};
  cart: Offer[] = [];

  private readonly timer: number;

  constructor(private priceResource: AlbionDataProjectResource, private cd: ChangeDetectorRef) {
    this.timer = setInterval(
      () => {
        this.ws$.next({ type: 'HEARTBEAT', data: (new Date()).getTime() })
      },
      5000
    );
  }

  fetchPrices$(offers: Offer[]): void {
    const itemIds = offers.map((o: Offer) => o.ItemTypeId.trim()),
      qualities = offers.map((o: Offer) => o.QualityLevel);

    if(itemIds.length === 0) {
      return;
    }

    if(qualities.length === 0) {
      qualities.push(1);
    }

    this.isPricesLoading = true;
    this.cd.markForCheck();

    this.priceResource.fetchPrices(itemIds, qualities, ['Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Caerleon'])
      .pipe(
        take(1),
        map(prices => prices.reduce(
          (map: any, price) => {
            if(!map.hasOwnProperty(price['item_id'])) {
              map[price['item_id']] = {};
            }

            if(!map[price['item_id']].hasOwnProperty(price['city'])) {
              map[price['item_id']][price['city']] = {};
            }

            map[price['item_id']][price['city']][price['quality']] = price;
            return map;
          },
          {}
        ))
      )
      .subscribe(
        prices => {
          this.prices = prices;
          this.isPricesLoading = false;

          this.cd.markForCheck();
        }
      );
  }

  onCartUpdate(offer: Offer) {
    if(this.cart.find(cO => cO.Id === offer.Id)) {
      return;
    }

    this.cart = [...this.cart, offer];

    if(this.cart.length > 0) {
    }

    this.cd.markForCheck();
  }

  onCartRemove(offer: Offer) {
    this.cart = (this.cart || []).filter(o => o.Id !== offer.Id);
  }

  onPricesUpdate(offers: Offer[]) {
    this.fetchPrices$(offers);
    this.cd.markForCheck();
  }

  onClearCart() {
    this.cart = [];
    this.cd.markForCheck();
  }

  onBackToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    if(this.timer) {
      clearInterval(this.timer);
    }
  }

  ngOnInit(): void {
    fromEvent(window, 'scroll')
      .pipe(
        untilDestroyed(this),
        throttleTime(250)
      )
      .subscribe(
        () => {
          this.scrolledEnoughToGoBack = window.scrollY > window.screen.availHeight * .75;
          this.cd.markForCheck();
        }
      );

    this.offers$.pipe(
      untilDestroyed(this)
    )
      .subscribe(
        offers => this.onPricesUpdate(offers)
      )
  }
}
