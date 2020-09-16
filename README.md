# NTNU Scripts
一些無聊做的小東西，供大家學習  
目前是自動防疫簽到（教室門口的 QR Code）跟 Day Pass 自動提交體溫

# Usage
首先你需要一個 Node.js 環境: [使用套件管理器安裝 Node.js](https://nodejs.org/zh-tw/download/package-manager/)  
然後把學號跟密碼丟進去就 OK 了

```shell
$ node index.js 40941234s password b102
{
  type: '1',
  success: true,
  msg: '地點： Ｂ102\n簽到時間： 2020-09-16 23:00:50'
}

$ node covid.js 40941234s password
{ wk_result: { wk_errcode: 0, wk_msg: 'OK' } }
```

# How?
透過現有的中間人攻擊套件 [mitmproxy](https://mitmproxy.org) 對 NTNU APP 實施[中間人攻擊 (MITM Attack)](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)，藉此記錄 NTNU APP 與學校伺服器交換的資訊，並使用 Node.js 實作即可
