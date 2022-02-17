import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../../utils';
import { createDeck } from '../../../businessLogic/decks'
import { CreateDeckRequest } from '../../../requests/CreateDeckRequest'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const newDeckBody: CreateDeckRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const newDeck = await createDeck(newDeckBody, userId)

    if(newDeck){
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Contol-Allow-Credentials': true
        },
        body: JSON.stringify({
          item: newDeck
        })
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

handler.use(
  cors({
    credentials: true
  })
)
