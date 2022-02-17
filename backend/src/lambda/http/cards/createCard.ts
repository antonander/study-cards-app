import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../../utils';
import { createCard } from '../../../businessLogic/cards';
import { CreateCardRequest } from '../../../requests/CreateCardRequest';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const newCardBody: CreateCardRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const deckId = event.pathParameters.deckId
    const newCard = await createCard(newCardBody, userId, deckId)

    if(newCard){
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Contol-Allow-Credentials': true
        },
        body: JSON.stringify({
          item: newCard
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
