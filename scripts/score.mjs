if (!process.argv[2] || !process.argv[3]) {
  console.error("Usage: node score.mjs id password")
  process.exit()
}

import NTNU from './ntnu.mjs'

const ntnu = new NTNU(process.argv[2], process.argv[3])

await ntnu.login()
const scoreList = await ntnu.getCourseScoreList()

console.log(scoreList.map(c => {
  let r = `${c.acadm_year}-${c.acadm_term} ${c.option_code} ${c.chn_name}`
  if (c.complete_flag != '1')
    return `${r} 成績尚未登錄`

  return `${r} 成績：${c.normal_score}`
}).join("\n"))
