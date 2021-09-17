(async function () {
  if (!process.argv[2] || !process.argv[3] || !process.argv[4]) {
    console.error("Usage: node index.js 40941234s password B102")
    process.exit(-1)
  }

  // 學號
  let muid = process.argv[2]
  // 密碼
  const mpassword = process.argv[3]
  
  muid = muid.toLowerCase()

  const fetch = require('node-fetch');
  const queryString = require('query-string');

  // sessionCheck, login, qrSsoSignin, StuSignin

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

  const headers = sessionCheck.headers.raw()
  if (headers['set-cookie'] !== undefined) {
    iportalwsCookies = headers['set-cookie'][0].replace("; path=/", "")
  } else {
    console.error("Failed to gather cookie from iportalws.ntnu.edu.tw")
    process.exit(-1)
  }

  // console.log(iportalwsCookies)
  
  // Now we login to iportalws.ntnu.edu.tw
  let login = await fetch('http://iportalws.ntnu.edu.tw/login.do', {
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
  })
  
  // We got stuName from login, this will be used later
  const stuName = encodeURIComponent((await login.json()).givenName)
  
  const qrSso = await (await fetch('http://iportalws.ntnu.edu.tw/qrSso.do', {
    method: 'POST',
    body: 'apOu=StuSignin' ,
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
  
  const sessionId = queryString.parse(qrSso.apUrl.split("?")[1])["sessionId"]

  const StuSignin = await fetch('https://ap.itc.ntnu.edu.tw/StuSignin/stu.do', {
    method: 'POST',
    body: `classroom=${process.argv[4]}&action=signin&sessionId=${sessionId}&userid=${muid.toUpperCase()}&stuName=${stuName}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Connection': 'keep-alive',
      'Accept': '*/*',
      'User-Agent': '%E8%87%BA%E7%81%A3%E5%B8%AB%E7%AF%84%E5%A4%A7%E5%AD%B8/1.45 CFNetwork/1126 Darwin/19.5.0',
      'Accept-Language': 'zh-tw',
      'Accept-Encoding': 'gzip, deflate, br'
    }
  })
  
  console.log(await StuSignin.json())
})();
