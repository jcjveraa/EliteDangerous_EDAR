export interface IEddnJournal1 {
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
  /**
   * Contains all properties from the listed events in the client's journal minus Localised strings and the properties marked below as 'disallowed'
   */
  message: {
    timestamp: string
    event:
      | 'Docked'
      | 'FSDJump'
      | 'Scan'
      | 'Location'
      | 'SAASignalsFound'
      | 'CarrierJump'
      | 'CodexEntry'
    /**
     * Whether the sending Cmdr has a Horizons pass.
     */
    horizons?: boolean
    /**
     * Whether the sending Cmdr has an Odyssey expansion.
     */
    odyssey?: boolean
    /**
     * Must be added by the sender if not present in the journal event
     */
    StarSystem: string
    /**
     * Must be added by the sender if not present in the journal event
     */
    StarPos: [number, number, number]
    /**
     * Should be added by the sender if not present in the journal event
     */
    SystemAddress: number
    /**
     * Present in Location, FSDJump and CarrierJump messages
     */
    Factions?: {
      [k: string]: unknown
    }[]

    [k: string]: unknown
  }
}
