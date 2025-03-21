

import requests
user_input = "chicken biryani recipe"
SERPER_API_KEY = '9031728befcb1f63e555731f6d51b3419a967587'
query = f"site:indiantamilrecipe.com {user_input}"

response = requests.post(
    'https://google.serper.dev/search',
    headers={'X-API-KEY': SERPER_API_KEY},
    json={'q': query}
)

result = response.json()
recipe_url = result['organic'][0]['link']

print(recipe_url)

from langchain_scrapegraph.tools import SmartScraperTool
import os
# Initialize the tool (uses SGAI_API_KEY from environment)
os.environ["SGAI_API_KEY"] = "sgai-689e4397-a3b1-4767-a624-d34b39954f7e"
tool = SmartScraperTool()

result = tool.invoke({
    "website_url": recipe_url,
    "user_prompt": f"Get the recipe for {user_input}",
})

print(result)