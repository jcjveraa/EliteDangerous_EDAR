export interface IEddnMessage {
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
  message: unknown}
