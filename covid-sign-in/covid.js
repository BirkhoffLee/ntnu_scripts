(async function () {
  if (!process.argv[2] || !process.argv[3]) {
    console.error("Usage: node covid.js 40941234s password")
    process.exit(-1)
  }

  // 學號
  let muid = process.argv[2]
  // 密碼
  const mpassword = process.argv[3]
  
  muid = muid.toLowerCase()

  const fetch = require('node-fetch');

  const sessionCheck = await fetch('http://iportalws.ntnu.edu.tw/sessionCheckApp.do', {
    method: 'POST',
    body: '' ,
    headers: {
      'Accept': '*/*',
      'App-Version': '1.45',
      'Proxy-Connection': 'keep-alive',
      'App-Locale': 'zh_TW',
      'Accept-Language': 'zh-tw',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Direk iOS App',
      'Connection': 'keep-alive',
    }
  })

  const sessionCheckHeaders = sessionCheck.headers.raw()
  if (sessionCheckHeaders['set-cookie'] !== undefined) {
    iportalwsCookies = sessionCheckHeaders['set-cookie'][0].replace("; path=/", "")
  } else {
    console.error("Failed to gather cookie from iportalws.ntnu.edu.tw")
    process.exit(-1)
  }
  
  // Now we login to iportalws.ntnu.edu.tw
  let login = await (await fetch('http://iportalws.ntnu.edu.tw/login.do', {
    method: 'POST',
    body: `muid=${muid}&mpassword=${mpassword}&forceMobile=app`,
    headers: {
      'Accept': '*/*',
      'App-Version': '1.45',
      'Proxy-Connection': 'keep-alive',
      'App-Locale': 'zh_TW',
      'Accept-Language': 'zh-tw',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Direk iOS App',
      'Connection': 'keep-alive',
      'Cookie': iportalwsCookies
    }
  })).json()
  
  const iportalwsSession = login.sessionId
  
  // Login to covid-19.csie.ntnu.edu.tw
  const c_day_pass_login = await fetch('https://covid-19.csie.ntnu.edu.tw/C_day_pass', {
    method: 'POST',
    body: `sessionId=${encodeURIComponent(iportalwsSession)}&userid=${muid.toUpperCase()}&role=${login.userRole}&empNO=`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    }
  })
  
  const covidHeaders = c_day_pass_login.headers.raw()
  if (covidHeaders['set-cookie'] !== undefined) {
    covidCookie = covidHeaders['set-cookie'][0].split(";")[0]
  } else {
    console.error("Failed to gather cookie from covid-19.csie.ntnu.edu.tw")
    process.exit(-1)
  }
  
  // Submit health data
  const c_day_pass = await (await fetch('https://covid-19.csie.ntnu.edu.tw/C_day_pass', {
    method: 'POST',
    body: `aebvcednet=a_save&wk_input_location=2&wk_input_temp_num=-1`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      'Cookie': covidCookie
    }
  })).json()

  console.log(c_day_pass)
})();
