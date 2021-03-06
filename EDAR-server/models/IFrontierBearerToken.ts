
export interface IFrontierBearerToken {
  access_token: string,
  token_type: string,
  expires_in: number,
  refresh_token: string,
  expires_at?: number,
}
