import * as Diff from 'diff'
import fs from 'fs'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const fsPromises = fs.promises

import NTNU from './ntnu.mjs'

const lastScorePath = resolve(__dirname, './lastScore.txt')

const ntnu = new NTNU("username", "password")

await ntnu.login()
const scoreList = await ntnu.getCourseScoreList()

const newScore = scoreList.map(c => {
  let r = `${c.acadm_year}-${c.acadm_term} ${c.option_code} ${c.chn_name}`
  if (c.complete_flag != '1')
    return `${r} 成績尚未登錄`

  return `${r} 成績：${c.normal_score}`
}).join("\n")

async function read() {
  try {
    return (await (fsPromises.readFile(lastScorePath))).toString()
  } catch (err) {
    console.error('Error occured while read', err)
  }
}

async function write(data) {
  try {
    return fsPromises.writeFile(lastScorePath, data)
  } catch (err) {
    console.error('Error occured while write', err)
  }
}

const lastScore = await read()
 
const diff = Diff.diffTrimmedLines(lastScore, newScore)

const difference = diff.filter(p => p.added).reduce((a, c) => a + c.value, "").trim()
console.log(difference)

if (difference) {
  const title = encodeURIComponent("成績更新")
  const content = encodeURIComponent(difference)
  // Send APNS notification with bark
  await fetch(`https://bark.birkhoff.me/xxxx/${title}/${content}`)
}

await write(newScore)
