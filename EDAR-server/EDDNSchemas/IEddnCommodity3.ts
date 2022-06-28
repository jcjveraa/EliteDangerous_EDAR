export interface IEddnCommodity3 {
  $schemaRef: string
  header: {
    uploaderID: string
    softwareName: string
    softwareVersion: string
    /**
     * Timestamp upon receipt at the gateway. If present, this property will be overwritten by the gateway; submitters are not intended to populate this property.
     */
    gatewayTimestamp?: string
    [k: string]: unknown
  }
  message: {
    systemName: string
    stationName: string
    marketId: number
    /**
     * Whether the sending Cmdr has a Horizons pass.
     */
    horizons?: boolean
    /**
     * Whether the sending Cmdr has an Odyssey expansion.
     */
    odyssey?: boolean
    timestamp: string
    /**
     * Commodities returned by the Companion API, with illegal commodities omitted
     */
    commodities: {
      /**
       * Symbolic name as returned by the Companion API
       */
      name: string
      meanPrice: number
      /**
       * Price to buy from the market
       */
      buyPrice: number
      stock: number
      /**
       * Note: A value of "" indicates that the commodity is not normally sold/purchased at this station, but is currently temporarily for sale/purchase
       */
      stockBracket: 0 | 1 | 2 | 3 | ''
      /**
       * Price to sell to the market
       */
      sellPrice: number
      demand: number
      /**
       * Note: A value of "" indicates that the commodity is not normally sold/purchased at this station, but is currently temporarily for sale/purchase
       */
      demandBracket: 0 | 1 | 2 | 3 | ''
      statusFlags?: [string, ...string[]]
      /**
       * Not present in CAPI data, so removed from Journal-sourced data
       */
      Producer?: {
        [k: string]: unknown
      }
      /**
       * Not present in CAPI data, so removed from Journal-sourced data
       */
      Rare?: {
        [k: string]: unknown
      }
      /**
       * Not wanted for historical reasons?
       */
      id?: {
        [k: string]: unknown
      }
    }[]
    economies?: {
      /**
       * Economy type as returned by the Companion API
       */
      name: string
      proportion: number
    }[]
    prohibited?: string[]
    /**
     * Not present in CAPI data, so removed from Journal-sourced data
     */
    StationType?: {
      [k: string]: unknown
    }
  }
}
