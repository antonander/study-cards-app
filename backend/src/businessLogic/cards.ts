import { createLogger } from '../utils/logger'
import { CardsAccess } from '../dataLayer/cardsAccess'
import { CardItem } from '../models/CardItem'
import * as uuid from 'uuid'
import { CreateCardRequest } from '../requests/CreateCardRequest'
import { AttachmentCardUtils } from '../fileStorage/attachmentCardUtils'
import { UpdateCardRequest } from '../requests/UpdateCardRequest'


const logger = createLogger('Cards')

const cardsAccess = new CardsAccess 
const cardsAttachments = new AttachmentCardUtils

export async function getCards(userId:string, deckId:string): Promise<CardItem[]> {

  try {
    const result = await cardsAccess.getCards(userId, deckId)
    return result
  } catch (e) {
    logger.error(`Failed to getDecks: `, e)
    return null
  }

}

export async function createCard(createDeckRequest: CreateCardRequest, userId: string, deckId:string): Promise<CardItem> {
    const cardId = uuid.v4()
    try {
        const result = await cardsAccess.createCard({
            deckId: deckId,
            userId: userId,
            cardId: cardId,
            frontside: {
              description: createDeckRequest.frontside.description,
              attachmentUrl: ''
            },
            backside: {
              description: createDeckRequest.backside.description,
              attachmentUrl: ''
            },
            createdAt: new Date().toISOString()
        })
        logger.info(`Result from createCard: ${result}`)
        return result
    } catch (e) {
        logger.error(`Failed to createCard: `, e)
        return null
    }

}

export async function deleteCard(cardId: string, deckId: string): Promise<Boolean> {

  logger.info(`Trying to delete card ${cardId} of deck ${deckId} `) 

  try {
      const result = await cardsAccess.deleteCard(deckId, cardId)
      return result
  } catch (e) {
      logger.info(`Failed to delete card ${cardId}: `, e) 
  }
}

export async function updateCard(cardId: string, deckId: string, updateRequest:UpdateCardRequest): Promise<Boolean> {

  logger.info(`About to attempt updateCard of card ${cardId} deck ${deckId}, with ${JSON.stringify(updateRequest)}`) 
  try {
      const result = await cardsAccess.updateCard(cardId, deckId, updateRequest)
      logger.info(`Result of updateCard: `, result) 
      return result
  } catch (e) {
      logger.error(`Failed to updateCard: `, e)
      return false
  }
}

export async function updateCardAttachmentUrl(deckId: string, cardId: string, attachmentId: string, side:string): Promise<any>{

  const attachmentUrl = cardsAttachments.getAttachmentUrl(attachmentId)
  logger.info(`Trying to updateCardAttachmentUrl card ${cardId} with attachment ID ${attachmentId}`)
  try {
      const result = await cardsAccess.updateCardAttachmentUrl(deckId, cardId, attachmentUrl, side)
      return result
  } catch (e) {
      logger.error('Failed to updateCardAttachmentUrl: ', e)
      return null
  }
  
}

export async function createCardAttachmentPresignedUrl(attachmentId:string): Promise<string>{
  logger.info(`About to createAttachmentPresignedUrl id: ${attachmentId}`) 
  return cardsAttachments.getUploadUrl(attachmentId)
}


