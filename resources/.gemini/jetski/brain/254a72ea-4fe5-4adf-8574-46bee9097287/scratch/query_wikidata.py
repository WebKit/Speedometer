import urllib.request
import urllib.parse
import json

def search_wikidata(query):
    url = "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=" + urllib.parse.quote(query) + "&language=en&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            if not data.get('search'):
                print(f"No results for {query}")
                return
            for result in data['search'][:10]:
                entity_id = result['id']
                label = result['label']
                description = result.get('description', '')
                print(f"Entity: {entity_id} ({label}) - {description}")
    except Exception as e:
        print(f"Error querying: {e}")

search_wikidata("Rising Sun")
