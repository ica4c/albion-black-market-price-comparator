export type ItemQuality = 1 | 2 | 3 | 4 | 5;
export type ItemTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type ItemEnchantment = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Offer {
  Id: string;
  UnitPriceSilver: number;
  TotalPriceSilver: number;
  Amount: number;
  Tier: ItemTier;
  IsFinished: boolean;
  AuctionType: "request";
  HasBuyerFetched: boolean,
  HasSellerFetched: boolean;
  SellerCharacterId: string | null,
  SellerName: string | null;
  BuyerCharacterId: string | null;
  BuyerName: string | null;
  ItemTypeId: string;
  ItemGroupTypeId: string;
  EnchantmentLevel: ItemEnchantment;
  QualityLevel: ItemQuality;
  Expires: string;
  ReferenceId: string;
}
