import { Telegraf } from 'telegraf'

import { message } from 'telegraf/filters'
import { ogg } from './ogg.js'
import { openaiMy } from './botOpenAi.js'
import { code } from 'telegraf/format'
import dotenv from 'dotenv'
dotenv.config()

const TELEGRAM_TOKEN = process.env.TEL_KEY

const bot = new Telegraf(TELEGRAM_TOKEN)
const history = [] //для отго чтобы поддерживать беседу

//обработкатекстовых сообщений
bot.on(message('voice'), async ctx => {
   try {
      await ctx.reply(code('Сообщение принял ждите....')) // сообщение которое показыавем бот

      const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
      const useId = String(ctx.message.from.id)

      const oggPath = await ogg.create(link.href, useId) //берем из нашего класса тут мылокально создаем наш файл и записывааем его в папку voice

      const mp3Path = await ogg.toMp3(oggPath, useId) //тут мы перекодируем наш файл

      const text = await openaiMy.transcription(mp3Path) //передаем для распознания наш созданній mp3 которій mp3 создаем своим голосом

      await ctx.reply(code(`Вас запрос: ${text}`)) // сообщение которое показыавем бот

      // const messages = [{ role: openaiMy.roles.USER, content: text }]
      history.push({ role: openaiMy.roles.USER, content: text })
      const response = await openaiMy.chat(history) //тут сы переадем сам текст нашему боту GPT

      await ctx.reply(response.content) // тут то что нам выводит бот
   } catch (e) {
      console.log(e.message)
   }
})

bot.on('message', async ctx => {
   try {
      if (ctx.message.text) {
         await ctx.reply(code('Сообщение принял ждите....'))
         const text = ctx.message.text
         await ctx.reply(code(`Вас запрос: ${text}`))
         history.push({ role: openaiMy.roles.USER, content: text })

         const response = await openaiMy.chat(history)
         await ctx.reply(response.content) // тут то что нам выводит бот
      }
   } catch (err) {
      console.log(err.message)
   }
})

//обработка команды
bot.command('start', async ctx => {
   await ctx.reply(JSON.stringify(ctx.message, null, 2))
})
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
