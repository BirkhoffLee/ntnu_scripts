#!/bin/bash

# your internal IP address in dorm network
ip=

# ntnu password
password=

cookie=/tmp/cookie

curl -sk "https://140.122.176.246/release/index.php?ip=$ip" -b "$cookie" -c "$cookie" | iconv -f big5 -t utf-8

curl -sk 'https://140.122.176.246/release/activate.php' \
-X 'POST' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-H 'Pragma: no-cache' \
-H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8;' \
-H 'Accept-Language: en-gb' \
-H 'Accept-Encoding: gzip, deflate, br' \
-H 'Cache-Control: no-cache' \
-H 'Host: 140.122.176.246' \
-H 'Origin: https://140.122.176.246' \
-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15' \
-H 'Referer: https://140.122.176.246/release/index.php' \
--data "mpwd=$password" -b "$cookie" -c "$cookie" | iconv -f big5 -t utf-8

curl -sk 'https://140.122.176.246/release/activate.php' \
-X 'POST' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-H 'Pragma: no-cache' \
-H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
-H 'Accept-Language: en-gb' \
-H 'Accept-Encoding: gzip, deflate, br' \
-H 'Cache-Control: no-cache' \
-H 'Host: 140.122.176.246' \
-H 'Origin: https://140.122.176.246' \
-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15' \
-H 'Referer: https://140.122.176.246/release/activate.php' \
--data 'action_do=yes&virus_update=yes&windows_update=yes&hacker_update=yes&comment=&confirmed=true' \
-b "$cookie" -c "$cookie" | iconv -f big5 -t utf-8
