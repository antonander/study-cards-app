/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateDeckRequest {
  name: string
  done: boolean
}