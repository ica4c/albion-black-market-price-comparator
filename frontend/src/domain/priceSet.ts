import {Location} from "./location";
import {ItemQuality} from "./offer";

export interface Price {
  "item_id": string;
  city: Location;
  quality: ItemQuality;
  sell_price_min: number | null;
  sell_price_min_date: string | null;
  sell_price_max: number | null;
  sell_price_max_date: string | null;
  buy_price_min: number | null;
  buy_price_min_date: string | null;
  buy_price_max: number | null;
  buy_price_max_date: string | null;
}
