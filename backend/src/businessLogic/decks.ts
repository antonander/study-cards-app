import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { DecksAccess } from '../dataLayer/decksAccess'
import { DeckItem } from '../models/DeckItem'
import { CreateDeckRequest } from '../requests/CreateDeckRequest'
import { UpdateDeckRequest } from '../requests/UpdateDeckRequest'

const logger = createLogger('Decks')

const decksAccess = new DecksAccess

export async function getDecks(userId): Promise<DeckItem[]> {

  try {
    const result = await decksAccess.getDecks(userId)
    return result
  } catch (e) {
    logger.error(`Failed to getDecks: `, e)
    return null
  }

}

export async function createDeck(createDeckRequest: CreateDeckRequest, userId: string): Promise<DeckItem> {
    const deckId = uuid.v4()

    try {
        const result = await decksAccess.createDeck({
            deckId: deckId,
            userId: userId,
            name: createDeckRequest.name,
            done: false,
            createdAt: new Date().toISOString()
        })
        logger.info(`Result from createDeck: ${result}`)
        return result
    } catch (e) {
        logger.error(`Failed to createDeck: `, e)
        return null
    }
}

export async function updateDeck(deckId: string, userId: string, updateRequest:UpdateDeckRequest): Promise<Boolean> {

  logger.info(`About to attempt updateDeck of todo ${deckId} user ${userId}, with ${JSON.stringify(updateRequest)}`) 
  try {
      const result = await decksAccess.updateDeck(userId, deckId, updateRequest)
      logger.info(`Result of updateDeck: `, result) 
      return result
  } catch (e) {
      logger.error(`Failed to updateDeck: `, e)
      return false
  }
}

export async function deleteDeck(deckId: string, userId: string): Promise<Boolean> {

  logger.info(`Trying to delete deck ${deckId} of user ${userId} `) 

  try {
      return await decksAccess.deleteDeck(userId, deckId)
  } catch (e) {
      logger.info(`Failed to delete deck ${deckId}: `, e)
      return false 
  }
}
