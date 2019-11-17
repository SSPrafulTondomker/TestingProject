import re

if __name__ == '__main__' :
    f = open('output.txt')
    content = f.read()
    f.close()
    f = open('result640.txt', 'a')
    content = content.split('\n')
    record = 640
    for line in content :
        if '[ report_end ]' in line :
            f.close()
            record += 1
            f = open('result'+str(record)+'.txt', 'a')
        if '<problem>' in line :
            flag, myStr = 0, ''
            line = line.split(' ')
            for word in line :
                if word == '</problem>' :
                    f.write('problem - '+myStr+'\n')
                    flag, myStr = 0, ''
                if flag == 1 :
                    myStr += " "+word
                if word == '<problem>' :
                    flag = 1
          
        if '<test>' in line :
            flag, myStr = 0, ''
            if type(line) != list :
                line = line.split(' ')
            for word in line :
                if word == '</test>' :
                    f.write('test - '+myStr+'\n')
                    flag, myStr = 0, ''
                if flag == 1 :
                    myStr += " "+word
                if word == '<test>' :
                    flag = 1
        if '<treatment>' in line :
            flag, myStr = 0, ''
            if type(line) != list :
                line = line.split(' ')
            for word in line :
                if word == '</treatment>' :
                    f.write('treatment - '+myStr+'\n')
                    flag, myStr = 0, ''
                if flag == 1 :
                    myStr += " "+word
                if word == '<treatment>' :
                    flag = 1
    