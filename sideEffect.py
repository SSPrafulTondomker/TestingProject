from selenium import webdriver
from xvfbwrapper import Xvfb
import bs4
import sys, re

if __name__ == '__main__' :
    
    # display = Xvfb()
    # display.start()

    driver = webdriver.Chrome("chromedriver")
    driver.get('https://www.everydayhealth.com/drugs/acyclovir#sideeffects')
    soup = bs4.BeautifulSoup (driver.page_source, 'lxml')
    src = soup.select ('ul')

    for ans in src :
        if (len(ans.getText()) == 20) :
            print (ans.getText())
        
    driver.close()
    # display.stop()