import { Telegraf } from 'telegraf'
import config from 'config'
import { message } from 'telegraf/filters'
import { ogg } from './ogg.js'
import { openai } from './openaiBot.js'
import { code } from 'telegraf/format'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

//обработкатекстовых сообщений
bot.on(message('voice'), async ctx => {
   try {
      await ctx.reply(code('Сообщение принял ждите....')) // сообщение которое показыавем бот

      const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
      const useId = String(ctx.message.from.id)

      const oggPath = await ogg.create(link.href, useId) //берем из нашего класса тут мылокально создаем наш файл и записывааем его в папку voice

      const mp3Path = await ogg.toMp3(oggPath, useId) //тут мы перекодируем наш файл

      const text = await openai.transcription(mp3Path) //передаем для распознания наш созданній mp3 которій mp3 создаем своим голосом

      await ctx.reply(code(`Вас запрос: ${text}`)) // сообщение которое показыавем бот

      const messages = [{ role: openai.roles.USER, content: text }]

      const response = await openai.chat(messages) //тут сы переадем сам текст нашему боту GPT

      await ctx.reply(response.content) // тут то что нам выводит бот
   } catch (e) {
      console.log(e.message)
   }
})

//обработка команды
bot.command('start', async ctx => {
   await ctx.reply(JSON.stringify(ctx.message, null, 2))
})
bot.launch()

process.once('STOP', () => bot.stop('STOP'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
