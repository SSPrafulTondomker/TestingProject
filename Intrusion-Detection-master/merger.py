def intrudor() :
	myfiles = {'media': open('download.jpeg' ,'rb')}
	URL = "http://localhost:5000/intrudorFile"	
	r = requests.post(url = URL, files = myfiles)


def record(inputString) :
	URL = "http://localhost:5000/entryPerson"
	data = {'medication': inputString}
	r = requests.post(url = URL,json = data)
