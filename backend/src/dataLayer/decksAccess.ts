import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { DeckItem } from '../models/DeckItem'
import { CardsAccess } from './cardsAccess'
import { UpdateDeckRequest } from '../requests/UpdateDeckRequest'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('DecksAccess')

const docClient = new XAWS.DynamoDB.DocumentClient()
const decksTable = process.env.DECKS_TABLE
const decksIndex = process.env.DECK_ID_INDEX

const cardsAccess = new CardsAccess 

export class DecksAccess {

    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
      ) {
    }

    async getDecks(userId: string): Promise<DeckItem[]> {

      logger.info(`About to fetch all decks for user: ${userId}`)

        try {

          const result = await docClient.query({
                TableName : decksTable,
                IndexName : decksIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
          }).promise()

          logger.info(`Result of fetching decks: ${result}`)
          
          const decks = result.Items
          return decks as DeckItem[]
    
        } catch (e) {
          logger.error(`Failed to getDecks: `, e)
          return null
        }

    }

    async createDeck(deck: DeckItem): Promise<DeckItem> {

      try {
        const result = await this.docClient.put({
            TableName: decksTable,
            Item: deck
        }).promise()

        logger.info(`Result of createDeck: ${result}`)
        return deck

      } catch (e) {
        logger.error(`Failed to createDeck: `, e)
        return null
      }
    }

    async updateDeck(userId:string, deckId: string, updateRequest:UpdateDeckRequest): Promise<Boolean> {

      try {   
          logger.info(`Attempting to updateDeck ${deckId} of user ${userId} with this info ${JSON.stringify(updateRequest)}`)

          const result = await this.docClient.update({
            TableName: decksTable,
            Key: {
              userId,
              deckId
            },
            UpdateExpression: 'set #name =:name, #done =:done',
            ExpressionAttributeValues: {
              ':name': updateRequest.name,
              ':done': updateRequest.done,
            },
            ExpressionAttributeNames: { '#name': 'name', '#done': 'done' },
            ReturnValues: 'UPDATED_NEW'
          }).promise()

            logger.info(`The result of the update ${result}`)
            return true;

      } catch (e) {
        logger.error(`Failed to updateDeck: `, e)
        return false
      }

    }

    async deleteDeck(userId:string, deckId: string) : Promise<Boolean> {
      try {
        
          // Delete all the cards of that deck.
          const cardsOnDeck = await cardsAccess.getCards(userId, deckId)

          for (let index = 0; index < cardsOnDeck.length; index++) {
            try {
              const cardId = cardsOnDeck[index].cardId;
              logger.info(`Trying to delete card ${cardId}...`)
              const result = await cardsAccess.deleteCard(deckId, cardId)
              console.log(`Result: `, result)
            } catch (e) {
              logger.error(`Failed to delete card: ${e}`)
              return false
            } 
          }

          try {

            // We delete the deck from the database
            const result = await this.docClient.delete({
                TableName: decksTable,
                Key: {
                    deckId,
                    userId
                }
            }).promise()

            if(result) return true

          } catch (error) {
            logger.error(`Failed to delete deck: ${error}`)
            return false
          }


      
      } catch (e) {
        logger.error(`Failed to delete card: `, e)
        return false
      }
    }
}


