import axios from 'axios'
import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import ffmpeg from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'
import { removeFile } from './utils.js'

//текущая папка в которой нахоиться данный файл
const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
   constructor() {
      ffmpeg.setFfmpegPath(installer.path) //устанавливаем путьдо непосредственно конвектера
   }

   toMp3(input, output) {
      try {
         const outputPath = resolve(dirname(input), `${output}.mp3`) //тут получаю путь к томуфайлу который мы сейчас создали чтобы потом сним работать

         //делаем саму конвертацию
         return new Promise((resolve, reject) => {
            ffmpeg(input)
               .inputOption('-t 30')
               .output(outputPath)
               .on('end', () => {
                  removeFile(input)
                  resolve(outputPath)
               }) //путь непосредственно к нашей mp3
               .on('error', err => reject(err.message))
               .run() //запускаем
         })
      } catch (e) {
         console.log(e.message)
      }
   }

   async create(url, filename) {
      try {
         const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`) // путь куда переадем наш созданный айл

         //делаем запрос
         const response = await axios({
            method: 'get',
            url,
            responseType: 'stream',
         })

         return new Promise(resolve => {
            //создаем стрим и передаем в него путь где файл будет записываться
            const stream = createWriteStream(oggPath)

            response.data.pipe(stream)
            stream.on('finish', () => resolve(oggPath))
         })
      } catch (e) {
         console.log(e.message)
      }
   }
}

export const ogg = new OggConverter()
