import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('AttachmentCardUtils')

export class AttachmentCardUtils {

    constructor(
      private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
      private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
      private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {}
  
    getAttachmentUrl(attachmentImageId: string): string {
        logger.info(`Atachment URL https://${this.bucketName}.s3.amazonaws.com/${attachmentImageId}`)
        return `https://${this.bucketName}.s3.amazonaws.com/${attachmentImageId}`
    }
  
    async processDeleteAttachment(attachmentUrl) : Promise<any>{
      const attachmentId = attachmentUrl.substring(attachmentUrl.lastIndexOf("/") + 1, attachmentUrl.length);
      logger.info(`The attachmentId sent to delete: ${attachmentId}`)
      return await this.deleteAttachmentFromBucket(attachmentId)
    }

    async getUploadUrl(attachmentId: string): Promise<string> {
      logger.info(`getUploadUrl, bucket:${this.bucketName}, key:${attachmentId}, expires:${parseInt(this.urlExpiration)}`)
      return this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: attachmentId,
        Expires: parseInt(this.urlExpiration)
      })
    }

    async deleteAttachmentFromBucket(attachmentId: string): Promise<boolean> {
      try {
          logger.info(`Trying to delete attachment ${attachmentId} from S3 bucket...`)
          const s3Result = await this.s3
          .deleteObject({
              Bucket: this.bucketName,
              Key: attachmentId
          })
          .promise()

          logger.info(`The result of trying to delete card attachment in S3: `, s3Result)
          return true
      } catch (e) {
          logger.error(`Failed to delete card attachment on s3delete: `, e)
          return false
      }
    }
  
  }