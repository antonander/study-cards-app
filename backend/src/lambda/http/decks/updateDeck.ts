import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../../utils'
import { createLogger } from '../../../utils/logger' 
import { UpdateDeckRequest } from '../../../requests/UpdateDeckRequest'
import { updateDeck } from '../../../businessLogic/decks'

const logger = createLogger('updateDeck')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const deckId = event.pathParameters.deckId
    const updatedDeck: UpdateDeckRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    const result = await updateDeck(deckId, userId, updatedDeck)

    if(result){
      logger.info(`Updated deck ${deckId} successfully`)
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: ''
      }
    }else{
      logger.info(`Updated deck ${deckId} failed`)
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
