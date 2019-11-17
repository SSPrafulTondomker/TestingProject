from selenium import webdriver
from xvfbwrapper import Xvfb
import bs4
import sys, re
from xml.etree import cElementTree as ET

if __name__ == '__main__' :
    
    # display = Xvfb()
    # display.start()

    driver = webdriver.Chrome("chromedriver")
    driver.get('http://text-machine.cs.uml.edu/cliner/demo/cgi-bin/cliner_demo.cgi/')


    with open("unannotated_records_deid_smoking.xml") as f:
        xml = f.read()
    tree = ET.fromstring(re.sub(r"(<\?xml[^>]+\?>)", r"\1<root>", xml) + "</root>")
    

    f = open('output.txt', 'w')
    rec_id = 639
    for child, rec_id in zip(tree.iter('TEXT'), tree.iter('RECORD')) :
        rec_id, rec_text = rec_id.attrib['ID'], child.text
        rec_text = rec_text.split('\n')
        print (rec_id)
        f.write(str(rec_id)+'\n')
        for inp in  rec_text :
            if inp != '' and len(inp) < 900:
                inputString = inp
                driver.execute_script("document.getElementsByName('user_input')[0].value = '';")

                text_box = driver.find_element_by_name('user_input')
                text_box.send_keys(inputString)


                btn = driver.find_element_by_name('my_form')
                btn.submit()

                soup = bs4.BeautifulSoup (driver.page_source, 'lxml')
                src = soup.select ('p')

                ans = src[0].getText()
                # print (ans)
                f.write(ans+'\n')
        f.write('+++++++++++++++++++++++++++++++++++++++++++++++++++++\n')
       
    
    f.close()
    # driver.close()
    # display.stop()