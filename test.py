import requests

# Ensure VPN connection to jambit
base_url = "http://localhost:3000/v1"
# Dummy key for constructor appeasement
openai_api_key = "dummy_key"

# Setup the header with the OpenAI API key
headers = {
    'Authorization': f'Bearer {openai_api_key}'
}

# Specific headers for jambit's API
jambit_api_key = "GLM0QqrHqGt7mNjumtC2VbQBDr9pcWUM"
jambit_headers = {'apikey': jambit_api_key}

data = {
     "stream": False,
    # One of the available models. See http://ollama.kong.7frank.internal.jambit.io/api/tags which are currently installed on the server
    "model": "1deepseek-coder:instruct", #"mistral:latest", # "deepseek-coder:instruct",
    # Your messages.
    "messages": [{"role": "user", "content": "Say this is a test"}]
}

response = requests.post(f"{base_url}/chat/completions", headers={**headers, **jambit_headers}, json=data)

if response.status_code == 200:
    result = response.json()['choices'][0]['message']
    print(result)
    print(response.headers['x-llm-proxy-forwarded-to'])
else:
    print("Failed to retrieve data:", response.status_code, response.text)
    print(response.headers['x-llm-proxy-forwarded-to'])