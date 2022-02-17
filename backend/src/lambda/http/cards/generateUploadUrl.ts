import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import * as uuid from 'uuid'
// import { getUserId } from '../../utils'
import { createLogger } from '../../../utils/logger'
import { createCardAttachmentPresignedUrl, updateCardAttachmentUrl } from '../../../businessLogic/cards'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const cardId = event.pathParameters.cardId
    const deckId = event.pathParameters.deckId
    const side = event.queryStringParameters.side
    // const userId = getUserId(event)
    const attachmentId = uuid.v4()

    logger.info(`The side: ${side}`)

    if(!side){
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: "You have to provide a side of the card for the upload."
      }
    }

  
    // Generate the presigned URL
    const uploadUrl = await createCardAttachmentPresignedUrl(attachmentId)
  
    logger.info(`The uploadURL generated: ${uploadUrl}`)

    if(uploadUrl){

      const result = updateCardAttachmentUrl(deckId, cardId, attachmentId, side)

      if(result){
        logger.info(`Success updating record with uploadUrl `, uploadUrl)
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: JSON.stringify({
            uploadUrl
          })
        }
      }else{
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: "An error ocurred, please review the logs for more information."
        }
      }

    }else{

      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
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
