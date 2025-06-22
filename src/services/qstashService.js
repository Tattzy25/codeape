import { Client } from '@upstash/qstash'

class QStashService {
  constructor() {
    this.client = new Client({
      baseUrl: process.env.QSTASH_URL,
      token: process.env.QSTASH_TOKEN,
    })
  }

  async publishMessage(url, payload) {
    try {
      const { messageId } = await this.client.publishJSON({
        url,
        body: payload,
      })
      return { success: true, messageId }
    } catch (error) {
      console.error('QStash publish failed:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new QStashService()