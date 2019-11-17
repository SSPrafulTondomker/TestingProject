from selenium import webdriver
from xvfbwrapper import Xvfb
import bs4
import sys



inputString = sys.argv[1]

#write file
f = open('input.txt', 'w')
f.write(inputString)
f.close()