/**
 * Interface representing a JWT token
 */
export interface JwksKeys {
  keys: JwksKeyProperties[]
}

export interface JwksKeyProperties {
  alg: string,
  kty: string,
  use: string,
  n: string,
  e: string,
  kid: string,
  x5t: string,
  x5c: string[]
}