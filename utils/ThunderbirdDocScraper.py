# !pip install requests beautifulsoup4 html2text

import os
import requests
from bs4 import BeautifulSoup
import html2text

# List of URLs to scrape
urls_to_scrape = [
'https://webextension-api.thunderbird.net/en/stable/',
'https://developer.thunderbird.net/add-ons/about-add-ons',
'https://developer.thunderbird.net/add-ons/hello-world-add-on',
'https://developer.thunderbird.net/add-ons/hello-world-add-on/using-webextension-apis',
'https://developer.thunderbird.net/add-ons/hello-world-add-on/using-a-background-page',
'https://developer.thunderbird.net/add-ons/hello-world-add-on/using-content-scripts',
'https://developer.thunderbird.net/add-ons/mailextensions',
'https://developer.thunderbird.net/add-ons/mailextensions/supported-manifest-keys',
'https://developer.thunderbird.net/add-ons/mailextensions/supported-ui-elements',
'https://developer.thunderbird.net/add-ons/mailextensions/supported-webextension-api',
'https://webextension-api.thunderbird.net/en/stable/accounts.html',
'https://webextension-api.thunderbird.net/en/stable/addressBooks.html',
'https://webextension-api.thunderbird.net/en/stable/addressBooks.provider.html',
'https://webextension-api.thunderbird.net/en/stable/addressBooks.contacts.html',
'https://webextension-api.thunderbird.net/en/stable/alarms.html',
'https://webextension-api.thunderbird.net/en/stable/action.html',
'https://webextension-api.thunderbird.net/en/stable/browserSettings.html',
'https://webextension-api.thunderbird.net/en/stable/browserSettings.colorManagement.html',
'https://webextension-api.thunderbird.net/en/stable/browsingData.html',
'https://webextension-api.thunderbird.net/en/stable/clipboard.html',
'https://webextension-api.thunderbird.net/en/stable/cloudFile.html',
'https://webextension-api.thunderbird.net/en/stable/commands.html',
'https://webextension-api.thunderbird.net/en/stable/compose.html',
'https://webextension-api.thunderbird.net/en/stable/composeAction.html',
'https://webextension-api.thunderbird.net/en/stable/contextualIdentities.html',
'https://webextension-api.thunderbird.net/en/stable/cookies.html',
'https://webextension-api.thunderbird.net/en/stable/cookies.html',
'https://webextension-api.thunderbird.net/en/stable/declarativeNetRequest.html',
'https://webextension-api.thunderbird.net/en/stable/dns.html',
'https://webextension-api.thunderbird.net/en/stable/downloads.html',
'https://webextension-api.thunderbird.net/en/stable/extension.html',
'https://webextension-api.thunderbird.net/en/stable/folders.html',
'https://webextension-api.thunderbird.net/en/stable/i18n.html',
'https://webextension-api.thunderbird.net/en/stable/identities.html',
'https://webextension-api.thunderbird.net/en/stable/identity.html',
'https://webextension-api.thunderbird.net/en/stable/idle.html',
'https://webextension-api.thunderbird.net/en/stable/mailTabs.html',
'https://webextension-api.thunderbird.net/en/stable/management.html',
'https://webextension-api.thunderbird.net/en/stable/menus.html',
'https://webextension-api.thunderbird.net/en/stable/messageDisplay.html',
'https://webextension-api.thunderbird.net/en/stable/messageDisplayAction.html',
'https://webextension-api.thunderbird.net/en/stable/messages.html',
'https://webextension-api.thunderbird.net/en/stable/messages.tags.html',
'https://webextension-api.thunderbird.net/en/stable/notifications.html',
'https://webextension-api.thunderbird.net/en/stable/permissions.html',
'https://webextension-api.thunderbird.net/en/stable/pkcs11.html',
'https://webextension-api.thunderbird.net/en/stable/privacy.html',
'https://webextension-api.thunderbird.net/en/stable/privacy.network.html',
'https://webextension-api.thunderbird.net/en/stable/privacy.services.html',
'https://webextension-api.thunderbird.net/en/stable/privacy.websites.html',
'https://webextension-api.thunderbird.net/en/stable/sessions.html',
'https://webextension-api.thunderbird.net/en/stable/spaces.html',
'https://webextension-api.thunderbird.net/en/stable/storage.html',
'https://webextension-api.thunderbird.net/en/stable/tabs.html',
'https://webextension-api.thunderbird.net/en/stable/theme.html',
'https://webextension-api.thunderbird.net/en/stable/messengerUtilities.html',
'https://webextension-api.thunderbird.net/en/stable/webNavigation.html',
'https://webextension-api.thunderbird.net/en/stable/webRequest.html',
'https://webextension-api.thunderbird.net/en/stable/windows.html',
'https://webextension-api.thunderbird.net/en/stable/examples/accounts.html',
'https://webextension-api.thunderbird.net/en/stable/examples/eventListeners.html',
'https://webextension-api.thunderbird.net/en/stable/examples/messageLists.html',
'https://webextension-api.thunderbird.net/en/stable/examples/vcard.html'
]

# Directory to save the Markdown files
output_dir = 'thunderbird_docs'
os.makedirs(output_dir, exist_ok=True)

# Initialize html2text converter
converter = html2text.HTML2Text()
converter.ignore_links = False

def save_page_as_markdown(url, output_path):
    """Fetches a webpage and saves its content as a Markdown file."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract the main content area; adjust the selector as needed
        content_div = soup.find('div', {'class': 'document'})
        if content_div:
            markdown_content = converter.handle(str(content_div))
            with open(output_path, 'w', encoding='utf-8') as file:
                file.write(markdown_content)
            print(f'Saved: {output_path}')
        else:
            print(f'Content not found for URL: {url}')
    except requests.exceptions.RequestException as e:
        print(f'Network error while processing URL {url}: {e}')
    except Exception as e:
        print(f'Failed to process URL {url}: {e}')

# Iterate through the list of URLs and save each page as a Markdown file
for url in urls_to_scrape:
    try:
        # Generate output file name based on the URL
        relative_path = url.split('//')[-1].replace('/', '_').replace(':', '')
        output_path = os.path.join(output_dir, f'{relative_path}.md')
        save_page_as_markdown(url, output_path)
    except Exception as e:
        print(f'Error handling URL {url}: {e}')