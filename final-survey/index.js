if (!process.argv[2] || !process.argv[3]) {
  console.error("Usage: node index.js 40941234s password")
  return 1;
}

// 學號
let muid = process.argv[2]
// 密碼
let mpassword = process.argv[3]

muid = muid.toLowerCase()

const fetch = require('node-fetch');

(async function () {
  // Get a session cookie
  const getSession = await fetch('https://iportal.ntnu.edu.tw/index.do', {
    method: 'GET',
    headers: {
      'Accept': '*/*',
      'Accept-Language': 'zh-tw',
      'Accept-Encoding': 'gzip, deflate',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15',
      'Referer': 'https://iportal.ntnu.edu.tw/',
      'Connection': 'keep-alive',
    }
  })

  let headers = getSession.headers.raw()
  if (headers['set-cookie'] !== undefined) {
    iportalwsCookies = headers['set-cookie'][0].replace("; path=/", "")
  } else {
    console.error("Failed to gather cookie from iportal.ntnu.edu.tw")
    return 1;
  }

  // Now we login to iportalws.ntnu.edu.tw
  await fetch('http://iportal.ntnu.edu.tw/login.do', {
    method: 'POST',
    body: `muid=${muid}&mpassword=${mpassword}&forceMobile=pc`,
    headers: {
      'Accept': '*/*',
      'Accept-Language': 'zh-tw',
      'Accept-Encoding': 'gzip, deflate',
      'Referer': 'https://iportal.ntnu.edu.tw/ntnu/',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15',
      'Connection': 'keep-alive',
      'Cookie': iportalwsCookies
    }
  })

  const ssoUrl = "https://iportal.ntnu.edu.tw/ssoIndex.do?apUrl=https://courseap.itc.ntnu.edu.tw/acadmSecondQuesSL/StdCourseListCtrl.do?action=login&termType=final&entrance=mobile&schClassType=Course&apOu=acadmSecondQuesSL_ET&sso=true&datetime1=1609918567113"

  const ssoSignin = await fetch(ssoUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Connection': 'keep-alive',
      'Accept': '*/*',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15',
      'Referer': 'https://courseap.itc.ntnu.edu.tw/acadmSecondQuesSL/StdCourseListCtrl.do?action=login&termType=final&entrance=mobile&schClassType=Course',
      'Accept-Language': 'zh-tw',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cookie': iportalwsCookies
    }
  })

  const info = await ssoSignin.text()

  const targetUrl = RegExp("action='(.*?)'").exec(info)[1]
  const sessionId = RegExp("sessionId' value='(.*?)'").exec(info)[1]

  const courseLogin = await fetch(targetUrl, {
    method: 'POST',
    body: `sessionId=${encodeURIComponent(sessionId)}&userid=${muid.toUpperCase()}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15',
      'Referer': ssoUrl,
      'Accept-Language': 'zh-tw',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cookie': iportalwsCookies
    }
  })

  headers = courseLogin.headers.raw()
  if (headers['set-cookie'] !== undefined) {
    courseapCookies = headers['set-cookie'][0].split(";")[0]
  } else {
    console.error("Failed to gather cookie from courseap.itc.ntnu.edu.tw")
    return 1;
  }

  const coursesResponse = await fetch("https://courseap.itc.ntnu.edu.tw/acadmSecondQuesSL/inquireStdCourse.do", {
    method: 'POST',
    body: "action=grid&schClassType=Course&termType=final&inqSysCode=&acadmYt=109_1",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Pragma': 'no-cache',
      'Accept': '*/*',
      'Accept-Language': 'zh-tw',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15',
      'Referer': targetUrl,
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': courseapCookies
    }
  })

  const coursesData = await coursesResponse.json()

  if (coursesData.totalCount == 0) return

  const courses = coursesData.data.filter(el => {
    return el.completeFlag === 'N'
  })

  function getCname (str) {
    return Buffer.from(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode('0x' + p1);
    }), 'binary').toString('base64')
  }

  for (course of courses) {
    console.log(course.courseChn)

    let url = "https://courseap.itc.ntnu.edu.tw/acadmSecondQuesSL/StdQuestionPageCtrl.do?action=ques"
    url += `&cname=${getCname(course.courseChn)}`
    url += `&ct_pk=${course.ct_pk}`
    url += `&language=chn&schClassType=Course&pSysCode=&termType=final&entrance=mobile`

    await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'text/html, */*; q=0.01',
        'Pragma': 'no-cache',
        'Accept-Language': 'zh-tw',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15',
        'Referer': targetUrl,
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': courseapCookies
      }
    })

    const response = await fetch("https://courseap.itc.ntnu.edu.tw/acadmSecondQuesSL/saveInqAns.do?action=save", {
      method: 'POST',
      body: 'ansJson=%5B%7B%22title%22%3A%221%22%2C%22qno%22%3A%221%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%5D%2C%22is_has_ans2%22%3Afalse%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%221%22%2C%22qno%22%3A%222%22%2C%22ans1%22%3A%224%22%2C%22ans2%22%3A%5B%5D%2C%22is_has_ans2%22%3Afalse%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%222%22%2C%22qno%22%3A%221%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%221%22%5D%2C%22is_has_ans2%22%3Atrue%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%222%22%2C%22qno%22%3A%222%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%221%22%5D%2C%22is_has_ans2%22%3Atrue%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%222%22%2C%22qno%22%3A%223%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%221%22%5D%2C%22is_has_ans2%22%3Atrue%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%222%22%2C%22qno%22%3A%224%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%221%22%5D%2C%22is_has_ans2%22%3Atrue%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%222%22%2C%22qno%22%3A%225%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%221%22%5D%2C%22is_has_ans2%22%3Atrue%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%222%22%2C%22qno%22%3A%226%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%5D%2C%22is_has_ans2%22%3Afalse%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%5D&textOpinion=%E7%84%A1&schClassType=Course&termType=final&entrance=mobile&jointTeachers=&ansJsonJoint=%5B%5D',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Pragma': 'no-cache',
        'Accept': '*/*',
        'Accept-Language': 'zh-tw',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15',
        'Referer': targetUrl,
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': courseapCookies
      }
    })
    
    console.log(await response.text())
  }
})();
