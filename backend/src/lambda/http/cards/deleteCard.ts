import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
// import { getUserId } from '../../utils'
import { createLogger } from '../../../utils/logger'
import { deleteCard } from '../../../businessLogic/cards'

const logger = createLogger('deleteCard')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const cardId = event.pathParameters.cardId
    const deckId = event.pathParameters.deckId
    // const userId = getUserId(event)

    const result = await deleteCard(cardId, deckId);

    if(result){
      logger.info(`Deleted ${cardId} successfully`) 
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: ''
      }
    }else{
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
