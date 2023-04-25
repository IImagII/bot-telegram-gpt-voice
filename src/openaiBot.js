import { Configuration, OpenAIApi } from 'openai'
import config from 'config'
import { createReadStream } from 'fs'

class OpenAi {
   roles = {
      ASSISTANT: 'assistant',
      USER: 'user',
      SYSTEM: 'system',
   }
   constructor(apiKey) {
      const configuration = new Configuration({
         apiKey,
      })
      this.openai = new OpenAIApi(configuration)
   }

   async chat(messages) {
      try {
         const response = await this.openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages, // это то что мы передаем чату
         })
         return response.data.choices[0].message //это непосредственно ответ от самого чата GPT
      } catch (err) {
         console.log('chat', err.message)
      }
   }

   //логика по работе с openai
   async transcription(filepath) {
      //преобразование речи в текст
      try {
         const response = await this.openai.createTranscription(
            createReadStream(filepath),
            'whisper-1'
         )
         return response.data.text
      } catch (err) {
         console.log('transcription', err.message)
      }
   }
}

export const openai = new OpenAi(config.get('OPEN_KEY'))
