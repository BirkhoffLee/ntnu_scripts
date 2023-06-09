if (!process.argv[2] || !process.argv[3]) {
  console.error("Usage: node finalSurvey.mjs id password")
  process.exit()
}

import NTNU from './ntnu.mjs'

const ntnu = new NTNU(process.argv[2], process.argv[3])

await ntnu.login()
await ntnu.loginToAcadmSecondQuesSL()

console.log("Login Succeed")

const rawCourses = await ntnu.inquireStdCourse()

console.log(`Courses count ${rawCourses.length}`)

const coursesToSurvey = rawCourses.filter(c => c.completeFlag !== 'Y')

console.log(`There are ${coursesToSurvey.length} surveys to fill out`)

for (const course of coursesToSurvey) {
  await ntnu.doCourseFinalSurvey(course)
}
