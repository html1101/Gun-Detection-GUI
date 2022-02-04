# Scraping website (ex. DuckDuckGo) for images
from bs4 import BeautifulSoup
from selenium import webdriver
from time import sleep

driver_path = "chromedriver.exe"
driver = webdriver.Chrome(executable_path=driver_path)

# Get response of requesting gun images from this URL.
url = "https://duckduckgo.com/?q=kid+with+gun&iax=images&ia=images"

driver.get(url)
sleep(30)
resp = driver.page_source
driver.quit()

# Pass source code to create BeautifulSoup object
# print(resp)
soup = BeautifulSoup(resp, 'html.parser')
# print(soup.prettify())
tags = soup.find_all("img", src=True, class_="js-lazyload")

# Whether to push into NO-GUNS.txt or GUNS.txt
file = open("GUNS.txt", "a")

for i in tags:
    # Push into file
    # if "https://" in i["src"]:
    print(F"Writing: https:{i['src']}")
    file.write("https:" + str(i["src"]) + "\n")

print(F"Added {len(tags)} files.")
file.close()