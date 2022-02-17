import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { CardItem } from '../models/CardItem'
import { UpdateCardRequest } from '../requests/UpdateCardRequest'
import { AttachmentCardUtils } from '../fileStorage/attachmentCardUtils'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('CardsAccess')

const docClient = new XAWS.DynamoDB.DocumentClient()
const cardsTable = process.env.CARDS_TABLE
const cardsIndex = process.env.CARD_ID_INDEX
const attachmentutils = new AttachmentCardUtils

export class CardsAccess { 

    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
      ) {
    }

    async getCards(userId: string, deckId:string): Promise<CardItem[]> {

      logger.info(`About to fetch all cards for user: ${userId} with deckid: ${deckId}`)

        try {

          const result = await docClient.query({
                TableName : cardsTable,
                IndexName : cardsIndex,
                KeyConditionExpression: 'deckId = :deckId', 
                ExpressionAttributeValues: {
                    ':deckId': deckId
                }
            }).promise()

            logger.info(`Result of fetching cards: ${result}`)
            
            const cards = result.Items
            return cards as CardItem[]
    
        } catch (e) {
          logger.error(`Failed to getCards: `, e)
          return null
        }

    }

    async getSingleCard(deckId: string, cardId:string): Promise<CardItem> {

      logger.info(`About to fetch single card for deck: ${deckId} with cardId: ${cardId}`)

        try {

            const result = await this.docClient.get({
              TableName: cardsTable,
              Key: {
                  cardId,
                  deckId
              }
            }).promise()

            console.log(`Result of fetching card: `, result)
            
            const card = result.Item
            return card as CardItem
    
        } catch (e) {
          logger.error(`Failed to getSingleCard: `, e)
          return null
        }

    }

    async createCard(card: CardItem): Promise<CardItem> {

      try {
        const result = await this.docClient.put({
            TableName: cardsTable,
            Item: card
        }).promise()

        logger.info(`Result of createCard: ${result}`)
        return card

      } catch (e) {
        logger.error(`Failed to createCard: `, e)
        return null
      }
    }

    async deleteCard(deckId:string, cardId: string) : Promise<Boolean> {
      try {        

          const card:any = await this.getSingleCard(deckId, cardId)

          logger.info(`The card set to delete: `, card)

          if(card.frontside.attachmentUrl){
            await attachmentutils.processDeleteAttachment(card.frontside.attachmentUrl)
          }
          if(card.backside.attachmentUrl){
            await attachmentutils.processDeleteAttachment(card.backside.attachmentUrl)
          }

          logger.info(`Done deleting attachments, now delete actual card: ${cardId}`)
          try {

            await this.docClient.delete({
                TableName: cardsTable,
                Key: {
                    cardId,
                    deckId
                }
            }).promise()

            return true

          } catch (error) {
            logger.error(`Problem deleting card: ${error}`)
            return false
          }

      } catch (e) {
        logger.error(`Failed to delete card: `, e)
        return false
      }
    }

    async updateCard(cardId: string, deckId: string, updateRequest:UpdateCardRequest): Promise<Boolean> {

      // Lets get the card first
      let card:any;
      try {   
        card = await this.getSingleCard(deckId, cardId)
      } catch (e) {
        logger.error(`Failed to updateCard getting single card: `, e)
        return false
      }

      if(card){
        try {   
            logger.info(`Attempting to updateCard ${cardId} of deck ${deckId} with this info ${JSON.stringify(updateRequest)}`)

            const result = await this.docClient.update({
              TableName: cardsTable,
              Key: {
                deckId,
                cardId
              },
              UpdateExpression: 'set #frontside =:frontside, #backside =:backside',
              ExpressionAttributeNames: { '#frontside': 'frontside', '#backside': 'backside'},
              ExpressionAttributeValues: {
                ':frontside': updateRequest.frontside ? updateRequest.frontside : card.frontside,
                ':backside': updateRequest.backside ?  updateRequest.backside : card.backside
              },
              ReturnValues: 'UPDATED_NEW'
            }).promise()

              logger.info(`The result of the card update ${result}`)
              return true;

        } catch (e) {
          logger.error(`Failed to updateCard: `, e)
          return false
        }
      }else{
          logger.error(`Failed to updateCard getting single card, card value: ${card}`)
          return false
      }

    }

    async updateCardAttachmentUrl(deckId: string, cardId: string, attachmentUrl: string, side:string) : Promise<any> {

      try {   
          logger.info(`Trying to update card attachment of card ${cardId} of deck ${deckId} with new attachmentId ${attachmentUrl}`)
   
          logger.info(`>> Expression set ${side}.attachmentUrl = :attachmentUrl`)

          const result = await this.docClient.update({
              TableName: cardsTable,
              Key: {
                deckId,
                cardId
              },
              UpdateExpression: 'set '+side+'.attachmentUrl = :attachmentUrl',
              ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
              }
            }).promise()

          return result

      } catch (e) {
        logger.error(`Failed to update card attachment of card ${cardId} of deck ${deckId} with new attachmentUrl. Error: `, e)
        return null
      }

    }

}


