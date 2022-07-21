export interface IEddnDockedEvent {
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
    DistFromStarLS: number,
    LandingPads?: { Large: number, Medium: number, Small: number },
    MarketID: number,
    Multicrew: false,
    StarPos: [number, number, number],
    StarSystem: string,
    StationEconomies: [],
    StationEconomy: string,
    StationFaction: { Name: string },
    StationGovernment: string,
    StationName: string,
    StationServices: string[],
    StationType: string,
    SystemAddress: string,
    Taxi: boolean,
    event: string,
    horizons: boolean,
    odyssey: boolean,
    timestamp: string
  }
}
