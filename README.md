# NTNU Scripts

* [course/](course/): 選課系統 sign-in PoC
* [covid-sign-in/](covid-sign-in/):
  * 自動防疫簽到（教室門口的 QR Code）: [covid-sign-in/index.js](covid-sign-in/index.js)
  * Day Pass 自動提交體溫: [covid-sign-in/covid.js](covid-sign-in/covid.js)
* [ntnu-5g-captive-portal/](ntnu-5g-captive-portal/): ntnu-5g captive portal 自動登入 on macOS
* [scripts/](scripts/):
  * [scripts/finalSurvey.mjs](scripts/finalSurvey.mjs): 填寫所有期末問卷
  * [scripts/score-monitor-example.mjs](scripts/score-monitor-example.mjs): 檢查並發送成績更新的通知，搭配 cron 使用
  * [scripts/ntnu.mjs](scripts/ntnu.mjs): 學校系統 ES7 class，目前有下列。用法參考上述應用
    * sign-in via iportal
    * sign-in via SSO
    * `inquireStdCourse`
    * `doCourseFinalSurvey`
    * `getCourseScoreList`

# 期末問卷填寫
```
$ git clone https://github.com/BirkhoffLee/ntnu_scripts
$ cd ntnu_scripts/scripts
$ npm install
$ node finalSurvey.js 40941234s password
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

# ntnu_5g Captive Portal
在 macOS 連上 SSID 爲 `ntnu_5g` 的 WiFi 之後，自動登入學校網路。

Codebase largely based on https://github.com/rimar/wifi-location-changer.

1. 先在 [ntnu-5g-captive-portal/ntnuwifiautologin](ntnu-5g-captive-portal/ntnuwifiautologin) 設定 username/password（NTNU SSO 學號密碼）
2. `cd ntnu-5g-captive-portal && ./install.sh`
3. [https://wificert2.ntnu.edu.tw:1003/logout?](https://wificert2.ntnu.edu.tw:1003/logout?)
4. WiFi 斷開重連。
5. `tail -f /usr/local/var/log/ntnuwifiautologin.log`
