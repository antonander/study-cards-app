import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares' 

import { getUserId } from '../../utils';
import { getCards as getCards  } from '../../../businessLogic/cards';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const deckId = event.pathParameters.deckId

    // Write your code here
    const cards = await getCards(getUserId(event), deckId);

    if(cards){
      return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            items: cards
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
