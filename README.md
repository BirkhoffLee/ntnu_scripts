# NTNU Scripts

# 期末問卷自動填寫
```
$ git clone https://github.com/BirkhoffLee/ntnu_scripts
$ cd ntnu_scripts/final-survey
$ npm install
$ node index.js 40941234s password
歐洲啟蒙運動中的政治與社會性
{"msg":"已完成，老師可清楚瞭解回饋，謝謝!!","success":true}

程式設計（一）
{"msg":"已完成，老師可清楚瞭解回饋，謝謝!!","success":true}

計算機概論
{"msg":"已完成，老師可清楚瞭解回饋，謝謝!!","success":true}

基礎電子學
{"msg":"已完成，老師可清楚瞭解回饋，謝謝!!","success":true}

基礎電子學實驗
{"msg":"已完成，老師可清楚瞭解回饋，謝謝!!","success":true}

微積分乙（一）
{"msg":"已完成，老師可清楚瞭解回饋，謝謝!!","success":true}
```

# COVID
* 自動防疫簽到（教室門口的 QR Code）: [covid-sign-in/index.js](covid-sign-in/index.js)
* Day Pass 自動提交體溫: [covid-sign-in/covid.js](covid-sign-in/covid.js)

## Usage
```shell
$ git clone https://github.com/BirkhoffLee/ntnu_scripts
$ cd ntnu_scripts/covid-sign-in
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

## How?
透過現有的中間人攻擊套件 [mitmproxy](https://mitmproxy.org) 對 NTNU APP 實施[中間人攻擊 (MITM Attack)](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)，藉此記錄 NTNU APP 與學校伺服器交換的資訊，並使用 Node.js 實作即可

## Protection
作爲 App 的開發者，一般我們利用 [Certificate Pinning](https://security.stackexchange.com/a/29990) 防範 MITM Attack

# ntnu_5g Captive Portal Auto Login
在 macOS 連上 SSID 爲 `ntnu_5g` 的 WiFi 之後，自動登入學校網路。

Codebase largely based on https://github.com/rimar/wifi-location-changer.

1. 先在 [ntnu-5g-captive-portal/ntnuwifiautologin](ntnu-5g-captive-portal/ntnuwifiautologin) 設定 username/password（NTNU SSO 學號密碼）
2. `cd ntnu-5g-captive-portal && ./install.sh`
3. [https://wificert2.ntnu.edu.tw:1003/logout?](https://wificert2.ntnu.edu.tw:1003/logout?)
4. WiFi 斷開重連。
5. `tail -f /usr/local/var/log/ntnuwifiautologin.log`

## wireguard
如果平常有在用 Wireguard 連 VPN，這裏有繞過 AS38844（NTNU）, AS17716（NTU）, AS9264（中研院）的網段的範例路由，
這樣開著 VPN 就不會連不到 https://wificert2.ntnu.edu.tw:1003 了
