from selenium import webdriver
from xvfbwrapper import Xvfb
import bs4
import sys
import os

# display = Xvfb()
# display.start()

# inputString = sys.argv[1]


driver = webdriver.Chrome("/home/stark-attack/Desktop/SEM7/Project/healthcare-master/chromedriver")
driver.get('http://localhost:5000')

driver.execute_script("document.getElementsByName('username')[0].value = 'intrudor';")
driver.execute_script("document.getElementsByName('password')[0].value = '123';")
# name_field = driver.find_element_by_name('username')
# name_field.value = "intrudor"

# pass_field = driver.find_element_by_name('password')
# pass_field.value = "123"


btn = driver.find_element_by_name('submit')
btn.click()

driver.get('http://localhost:5000/sendFiles')
# # driver.execute_script("document.getElementById('user_input').style.body = 'block';")

file_input = driver.find_element_by_id("file-input")
file_input.send_keys(os.getcwd()+"/download.jpeg")

# # text_box = driver.find_element_by_name('user_input')
# # text_box.send_keys(inputString)


btn = driver.find_element_by_id('sendFiles-btn')
btn.click()

# soup = bs4.BeautifulSoup (driver.page_source, 'lxml')
# src = soup.select ('p')

# ans = src[0].getText()[166:]
# s = ''
# c = 1
# for i in ans :
#     if i == ">" :
#         s += '></font>'
#     elif i == "<" :
#         s += '<font color = #FF0000><'
#     else :
#         s += i
# print (ans)
# print (sys.argv[1])



driver.close()
# display.stop()