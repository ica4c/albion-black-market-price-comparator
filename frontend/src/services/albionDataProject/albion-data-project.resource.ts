import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Price} from "../../domain/priceSet";
import {environment} from "../../environments/environment";
import {Location} from "../../domain/location";
import {ItemQuality} from "../../domain/offer";
import {uniq} from "lodash";

@Injectable({ providedIn: 'root' })
export class AlbionDataProjectResource {
  constructor(private http: HttpClient) {
  }

  public fetchPrices(itemIds: string[], qualities: ItemQuality[] = [], cities: Location[] = []): Observable<Price[]> {
    const url = `${environment.services.albionDataProject.host}/stats/prices/${uniq(itemIds).join(',')}`;
    const params: any = {};

    if(Array.isArray(qualities) && qualities.length > 0) {
      params['qualities'] = uniq(qualities).join(',');
    }

    if(Array.isArray(cities) && cities.length > 0) {
      params['locations'] = uniq(cities).join(',');
    }

    return this.http.get<Price[]>(url, { params, headers: {'Accept': 'application/json'} });
  }
}
