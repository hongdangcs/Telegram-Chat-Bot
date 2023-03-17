from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

# create a new Chrome browser instance in headless mode
chrome_options = Options()
chrome_options.add_argument("--headless")
driver = webdriver.Chrome(options=chrome_options)

# navigate to the webpage
driver.get("https://www.google.com")

# find the element to screenshot
element = driver.find_element(By.CSS_SELECTOR, ".lnXdpd")

# take a screenshot of the element
element.screenshot("./photo/element_screenshot.png")

# close the browser instance
driver.quit()
