import fetch from 'node-fetch'
import { deserialize, serialize } from 'v8'

const structuredClone = obj => {
  return deserialize(serialize(obj))
}

const constructURLWithParams = (baseURL, params) => {
  let url = new URL(baseURL)
  url.search = new URLSearchParams(params).toString()
  return url
}

const parseCookiesFromFetchObject = response => {
  if (!response.headers.raw()['set-cookie'])
    throw new Error("Unable to parse cookie for response: set-cookie header not present")
  
  const rawString = response.headers.raw()['set-cookie'][0].split(";").map(e => e.trim())
  
  const parsed = Object.fromEntries(rawString.map(e => e.split("=")))
  const raw = Object.fromEntries(rawString.map(e => {
    const kvPair = e.split("=")
    kvPair[1] = e
    return kvPair
  }))

  return { raw, parsed }
}

class NTNU {
  #id
  #password
  #session = {
    iportal: "",
    courseap_root: "",
    courseap_acadmSecondQuesSL: ""
  }
  
  userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15'
  headers = {
    'Accept': '*/*',
    'Accept-Language': 'zh-tw'
  }
  courseInfo = {
    term: '',
    session: '',
  }

  constructor (id, password) {
    this.#id = id.toLowerCase()
    this.#password = password
    this.headers = this.makeHeader({
      'User-Agent': this.userAgent
    })
  }
  
  set userAgent (uaString) {
    this.userAgent = uaString
    this.headers['User-Agent'] = this.userAgent
  }
  
  // This merges headers and ele into an object and returns it
  makeHeader (ele = {}) {
    // Object.assign overrides the object, so we shallow clone first
    const headers = structuredClone(this.headers)
    return Object.assign({}, headers, ele)
  }

  async login () {
    const iPortalSession = await fetch("https://iportal.ntnu.edu.tw/login.do", {
      method: 'POST',
      body: new URLSearchParams({
        'muid': this.#id,
        'mpassword': this.#password,
        'forceMobile': 'pc'
      }),
      headers: this.makeHeader({
        'Referer': 'https://iportal.ntnu.edu.tw/ntnu/'
      })
    })
    
    const body = await iPortalSession.text()

    if (body.includes("登入失敗"))
      throw new Error("Login failure; check your username and password")

    try {
      this.#session.iportal = parseCookiesFromFetchObject(iPortalSession).raw.JSESSIONID
    } catch (e) {
      throw new Error("Login failure, error from remote server")
    }

    if (this.#session.iportal)
      return true

    throw new Error("Failed to get session cookie")
  }

  async getSsoSession (apUrl, apOu) {
    const url = constructURLWithParams("https://iportal.ntnu.edu.tw/ssoIndex.do", {
      apUrl: apUrl,
      apOu: apOu,
      datetime1: Date.now(),
      sso: true
    })

    const ssoSignin = await fetch(url, {
      method: 'GET',
      headers: this.makeHeader({
        'Cookie': this.#session.iportal
      })
    })
    
    const body = await ssoSignin.text()

    if (!body.includes("系統登入中")) 
      throw new Error("Failed to sign in via NTNU SSO")

    return RegExp("sessionId' value='(.*?)'").exec(body)[1]
  }
  
  async loginToAcadmSecondQuesSL () {
    const target = "https://courseap.itc.ntnu.edu.tw/acadmSecondQuesSL/StdCourseListCtrl.do?action=login&termType=final&entrance=mobile&schClassType=Course"

    const sessionId = await this.getSsoSession(target, "acadmSecondQuesSL_ET")

    const courseLogin = await fetch(target, {
      method: 'POST',
      body: new URLSearchParams({
        'sessionId': sessionId,
        'userid': this.#id.toUpperCase()
      }),
      headers: this.makeHeader()
    })

    const body = await courseLogin.text()
    
    if (body.includes("will open from"))
      throw new Error(`time window for acadmSecondQuesSL has passed`)
    
    if (!body.includes("acadmYt"))
      throw new Error(`loginToAcadmSecondQuesSL failed, remote returned ${body}`)
    
    this.courseInfo.term = RegExp("var acadmYt = '(.*?)';").exec(body)[1]
    
    if (!this.courseInfo.term)
      throw new Error("Unable to get acadmYt")
      
    try {
      this.#session.courseap_acadmSecondQuesSL = parseCookiesFromFetchObject(courseLogin).raw.JSESSIONID
    } catch (e) {
      throw new Error("Unable to get session at courseap.itc.ntnu.edu.tw")
    }

    return true
  }
  
  async inquireStdCourse () {
    const coursesResponse = await fetch("https://courseap.itc.ntnu.edu.tw/acadmSecondQuesSL/inquireStdCourse.do", {
      method: 'POST',
      body: new URLSearchParams({
        action: "grid",
        schClassType: "Course",
        termType: "final",
        inqSysCode: "",
        acadmYt: this.courseInfo.term,
      }),
      headers: this.makeHeader({
        'Cookie': this.#session.courseap_acadmSecondQuesSL
      })
    })
    
    const resp = await coursesResponse.json()
    
    if (resp.success)
      return resp.data
  
    throw new Error("Unable to inquireStdCourse")
  }
  
  async doCourseFinalSurvey (rawCourse) {
    const cname = Buffer.from(
      encodeURIComponent(rawCourse.courseChn)
        .replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)),
      'binary'
    ).toString('base64')

    const url = constructURLWithParams("https://courseap.itc.ntnu.edu.tw/acadmSecondQuesSL/StdQuestionPageCtrl.do", {
      action: "ques",
      cname: cname,
      ct_pk: rawCourse.ct_pk,
      language: "chn",
      schClassType: "Course",
      pSysCode: "",
      termType: "final",
      entrance: "mobile",
    })

    await fetch(url, {
      method: 'GET',
      headers: this.makeHeader({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': this.#session.courseap_acadmSecondQuesSL
      })
    })

    const response = await fetch("https://courseap.itc.ntnu.edu.tw/acadmSecondQuesSL/saveInqAns.do?action=save", {
      method: 'POST',
      body: 'ansJson=%5B%7B%22title%22%3A%221%22%2C%22qno%22%3A%221%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%5D%2C%22is_has_ans2%22%3Afalse%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%221%22%2C%22qno%22%3A%222%22%2C%22ans1%22%3A%224%22%2C%22ans2%22%3A%5B%5D%2C%22is_has_ans2%22%3Afalse%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%222%22%2C%22qno%22%3A%221%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%221%22%5D%2C%22is_has_ans2%22%3Atrue%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%222%22%2C%22qno%22%3A%222%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%221%22%5D%2C%22is_has_ans2%22%3Atrue%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%222%22%2C%22qno%22%3A%223%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%221%22%5D%2C%22is_has_ans2%22%3Atrue%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%222%22%2C%22qno%22%3A%224%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%221%22%5D%2C%22is_has_ans2%22%3Atrue%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%222%22%2C%22qno%22%3A%225%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%221%22%5D%2C%22is_has_ans2%22%3Atrue%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%2C%7B%22title%22%3A%222%22%2C%22qno%22%3A%226%22%2C%22ans1%22%3A%225%22%2C%22ans2%22%3A%5B%5D%2C%22is_has_ans2%22%3Afalse%2C%22course_joint_flag%22%3A%22%22%2C%22L1_joint_flag%22%3A%22%22%7D%5D&textOpinion=%E7%84%A1&schClassType=Course&termType=final&entrance=mobile&jointTeachers=&ansJsonJoint=%5B%5D',
      headers: this.makeHeader({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': this.#session.courseap_acadmSecondQuesSL
      })
    })
    
    const resp = await response.json()
    
    if (!resp.success)
      throw new Error("Unable to save inquiry answer for course " + rawCourse.courseChn + ", remote returned " + JSON.stringify(resp))
    
    return true
  }
  
  async getCourseScoreList () {
    const target = "https://courseap.itc.ntnu.edu.tw/acadmSL/acadmSL.do"

    const acadmSL = await fetch(target, {
      method: 'POST',
      body: new URLSearchParams({
        'sessionId': await this.getSsoSession(target, "acadmSL"),
        'userid': this.#id.toUpperCase()
      }),
      headers: this.makeHeader()
    })
    
    const ssid = parseCookiesFromFetchObject(acadmSL).parsed.JSESSIONID

    const acadmTranscript = await fetch(constructURLWithParams("https://courseap.itc.ntnu.edu.tw/acadmTranscript/AccseldServlet.do", { ssid }) , {
      method: 'GET'
    }) // Get session on /acadmTranscript

    const response = await fetch(constructURLWithParams("https://courseap.itc.ntnu.edu.tw/acadmTranscript/AccseldServlet.do", {
      action: "scorelist",
      _dc: Date.now(),
    }), {
      method: 'POST',
      body: "page=1&start=0&limit=300",
      headers: this.makeHeader({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': parseCookiesFromFetchObject(acadmTranscript).raw.JSESSIONID,
      })
    })
    
    const resp = await response.json()
    
    if (!resp.List)
      throw new Error("Unable to get score list, remote returned " + JSON.stringify(resp))
    
    return resp.List
  }
}

export default NTNU
