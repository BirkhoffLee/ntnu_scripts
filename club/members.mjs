// npm i node-fetch
import fetch from 'node-fetch';

// 登入到 學生社團系統 > 社團幹部 > 社員資料維護，右鍵檢查元素、網路，然後按重新整理之後在檢查元素的地方找 Club_MemberCadreCtrl
// 點進去之後找 Cookie: JSESSIONID=D46717D80BD92A32EF6016AB97FEBDA5
// 這邊就填 JSESSIONID=D46717D80BD92A32EF6016AB97FEBDA5
const cookie = 'JSESSIONID=D46717D80BD92A32EF6016AB97FEBDA5';

// 這邊填學號
const newMembers = [""];

for (const [i, el] of newMembers.entries()) {
  let response = await fetch('https://ap.itc.ntnu.edu.tw/club/Club_MemberCadreCtrl?Action=Insert&PageType=1B', {
    method: 'POST',
    headers: {
      'Cookie': cookie, 
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept-Language': 'en-GB,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Host': 'ap.itc.ntnu.edu.tw',
      'Origin': 'https://ap.itc.ntnu.edu.tw',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
      'Referer': 'https://ap.itc.ntnu.edu.tw/club/Club_MemberCadreCtrl?Action=Page1BI',
      'Connection': 'keep-alive',
    },
    body: `el_Club_MemberCadreInsert01_StdtNo=${el}&el_Club_MemberCadreInsert01_JobTitle=%E7%A4%BE%E5%93%A1&el_Club_MemberCadreInsert01_Memo1=&GoToUrl=Club_MemberCadreCtrl%3FAction%3DPage1BL`
  });

  const data = await response.text();

  const result = data.includes(`儲存成功! (${el})`);

  if (!result) {
    console.log("[!] Failed to save " + el);
  } else {
    console.log("[+] " + el)
  }
}
