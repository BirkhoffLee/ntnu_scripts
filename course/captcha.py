import sys
import os
import re
import subprocess
import tempfile
from PIL import Image
from pathlib import Path
from operator import itemgetter

def parse_captcha(filename):
    """Return the text for thie image using Tesseract
    """
    img = threshold(filename)
    return tesseract(img)


def threshold(filename, limit=100):
    # read in colour channels
    img = Image.open(filename)
    img = img.resize((int(img.size[0] * 1.5), int(img.size[1] * 1.5))).convert("L")
    his = img.histogram()

    # get 4 most appeared colors
    allColors = {}
    mostColors = []

    for i in range(256):
        if i == 225: continue # skip white
        allColors[i] = his[i]

    for color, appearances in sorted(allColors.items(), key=itemgetter(1), reverse=True)[0:10]:
        # print(color, appearances)
        mostColors.append(color)

    pixdata = img.load()

    for y in range(img.size[1]):
        for x in range(img.size[0]):
            for color in mostColors:
                if abs(pixdata[x, y] - color) < 35:
                    pixdata[x, y] = 225
                else:
                    pixdata[x, y] = 0

    # img.save('tmp/threshold_' + Path(filename).stem + ".png")
    img.save('tmp/threshold.png')
    return img



def call_command(*args):
    """call given command arguments, raise exception if error, and return output
    """
    c = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, error = c.communicate()
    if c.returncode != 0:
        if error:
            print(error)
        print("Error running `%s'" % ' '.join(args))
    try:
        return output.decode('utf-8').strip()
    except UnicodeDecodeError:
        return ""


def tesseract(f):
    """Decode image with Tesseract
    """
    # perform OCR
    output_filename = f.name.replace('.tif', '.txt')
    call_command('tesseract', f.name, output_filename.replace('.txt', ''))

    # read in result from output file
    result = open(output_filename).read()
    os.remove(output_filename)
    return clean(result)


def gocr(f):
    """Decode image with gocr
    """
    result = call_command('gocr', '-i', f.name)
    return clean(result)


def ocrad(f):
    """Decode image with ocrad
    """
    result = call_command('ocrad', f.name)
    return clean(result)


def clean(s):
    """Standardize the OCR output
    """
    # remove non-alpha numeric text
    return re.sub('[^+\-\/=0-9a-z]', '', s.lower())

def guess(question):
    length = len(question)
    answer = question

    if length < 2:
        return ""

    # if theres only letters we return it
    if question.isalpha():
        return question

    question = question.replace("--", "=").replace("s", "5").replace("g", "9").replace("l", "1").replace("t", "7")

    # it's an equation, find the numbers and operator

    if not question[0].isnumeric():
        return question

    number1 = int(question[0])

    if length == 2:
        # if it's digit + digit, return a * b
        if not question[1].isnumeric():
            return question.replace("5", "s").replace("9", "g").replace("1", "l").replace("7", "t")

        return number1 * int(question[1])

    if not question[2].isnumeric():
        if not question[1].isnumeric():
            return question.replace("5", "s").replace("9", "g").replace("1", "l").replace("7", "t")

        # 79=
        number2 = int(question[1])
        return number1 * number2
    else:
        number2 = int(question[2])

    if not number1 and number1 != 0:
        return question.replace("5", "s").replace("9", "g").replace("1", "l").replace("7", "t")

    if not number2 and number2 != 0:
        return question.replace("5", "s").replace("9", "g").replace("1", "l").replace("7", "t")

    if question[1] == "+":
        answer = number1 + number2
    elif question[1] == "-":
        answer = number1 - number2
    elif question[1] == "/":
        answer = number1 / number2
    else:
        answer = number1 * number2

    return answer

def preprocess(result):
    if result[:1] == "=":
        result = result[0:-1]

    result = result.replace("--", "=")

    length = len(result)

    if length > 4:
        return 0

    return length

def solve(filename):
    img = threshold(filename)

    tif = tempfile.NamedTemporaryFile(suffix='.tif')
    ppm = tempfile.NamedTemporaryFile(suffix='.ppm')
    img.save(tif.name)
    img.save(ppm.name)

    results = [ocrad(ppm), gocr(ppm), tesseract(tif)]
    resultsLengths = list(map(preprocess, results))
    index = max(range(len(resultsLengths)), key=resultsLengths.__getitem__)
    question = results[index]

    return guess(question)

if __name__ == '__main__':
    filenames = sys.argv[1:]
    if filenames:
        for filename in filenames:
            img = threshold(filename)

            tif = tempfile.NamedTemporaryFile(suffix='.tif')
            ppm = tempfile.NamedTemporaryFile(suffix='.ppm')
            img.save(tif.name)
            img.save(ppm.name)

            results = [ocrad(ppm), gocr(ppm), tesseract(tif)]
            resultsLengths = list(map(preprocess, results))
            index = max(range(len(resultsLengths)), key=resultsLengths.__getitem__)
            question = results[index]

            if index == 0: source = "ocrad"
            elif index == 1: source = "gocr"
            elif index == 2: source = "tesseract"

            print("{}, {}, {}, {}".format(filename, source, question, guess(question)))
    else:
        print('Usage: %s [image1] [image2] ...' % sys.argv[0])
