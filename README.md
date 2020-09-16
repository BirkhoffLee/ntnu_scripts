# NTNU Scripts
一些無聊做的小玩具，非常有學習價值，供大家參考  
牽涉到的技術比較多，而且 code 的部分因爲使用 ES7 語法會比較不容易理解，但是看關鍵字之後也很容易用 python 實作一遍

# List
* 自動防疫簽到（教室門口的 QR Code）: [index.js](index.js)
* Day Pass 自動提交體溫: [covid.js](covid.js)

# Usage
首先你需要一個 Node.js 環境：[使用套件管理器安裝 Node.js](https://nodejs.org/zh-tw/download/package-manager/)
然後：

```shell
$ git clone https://github.com/BirkhoffLee/ntnu_scripts
$ cd ntnu_scripts
$ npm install
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

# Protection
作爲 App 的開發者，一般我們利用 [Certificate Pinning](https://security.stackexchange.com/a/29990) 防範 MITM Attack
