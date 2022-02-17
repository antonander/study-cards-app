import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../../utils/logger' 
import { UpdateCardRequest } from '../../../requests/UpdateCardRequest'
import { updateCard } from '../../../businessLogic/cards'

const logger = createLogger('updateCard')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const deckId = event.pathParameters.deckId
    const cardId = event.pathParameters.cardId
    const updatedCard: UpdateCardRequest = JSON.parse(event.body)

    const result = await updateCard(cardId, deckId, updatedCard)

    if(result){
      logger.info(`Updated card ${cardId} successfully`)
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: ''
      }
    }else{
      logger.info(`Update of card ${cardId} failed`)
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: "An error ocurred, please review the logs for more information."
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
