import requests, re, json

import captcha

userid = ''
password = ''

def _(a): return "https://cos3s.ntnu.edu.tw/AasEnrollStudent/" + a

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15',
    'Referer': _('LoginCheckCtrl?language=TW'),
    'X-Requested-With': 'XMLHttpRequest'
}

s = requests.Session()
s.headers.update(headers)

# Get session & login ID
print("Gathering session.")

loginPage = s.get(_('LoginCheckCtrl?language=TW'))
loginPageRe = re.findall(r"LoginCheckCtrl\?action=login&id=' \+ '(\w+)',", loginPage.text)

if len(loginPageRe) < 1:
    print("Unable to find login id")
    exit()

loginID = loginPageRe[0]
print("Found login ID " + loginID + "\n")

while True:
    print("Downloading CAPTCHA.")
    randImage = s.get(_('RandImage'), stream=True).raw

    print("Solving CAPTCHA.")
    validateCode = captcha.solve(randImage)
    print("CAPTCHA solved as " + str(validateCode))

    if validateCode == "": validateCode = "hviw" # produce a fake one

    payload = {
        'userid': userid,
        'password': password,
        'validateCode': validateCode,
        'checkTW': '1'
    }

    print("Signing in.")
    login = s.post(_('LoginCheckCtrl?action=login&id=' + loginID), data=payload).text

    if "rue" in login:
        print("Signed in")
        break

    print("Sign in failed: " + login + ", retrying\n")

indexPage = s.get(_('IndexCtrl?language=TW'))
indexPageRe = re.findall(r"姓名.*?value: '(\W+)'", indexPage.text, flags=re.MULTILINE | re.DOTALL | re.ASCII)

if len(indexPageRe) < 1:
    print(indexPageRe)
    exit()

name = indexPageRe[0]
print("Logging in as " + name + "\n")

payload = {
    'userid': userid,
    'stdName': name,
    'checkTW': '1'
}

headers['Referer'] = _('IndexCtrl?language=TW')
s.headers.update(headers)
login = s.post(_('LoginCtrl'), data=payload)

if "rue" not in login.text:
    print(login)
    exit()

print("Login successful")
