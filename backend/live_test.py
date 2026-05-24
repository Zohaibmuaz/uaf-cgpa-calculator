import asyncio
import aiohttp
import re
from bs4 import BeautifulSoup

async def test_live_fetch(ag_number):
    base_url = "https://lms.uaf.edu.pk"
    login_url = f"{base_url}/login/index.php"
    result_url = f"{base_url}/course/uaf_student_result.php"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    connector = aiohttp.TCPConnector(ssl=False)
    async with aiohttp.ClientSession(headers=headers, connector=connector) as session:
        print(f"Connecting to {login_url}...")
        async with session.get(login_url) as resp:
            html = await resp.text()
            token_match = re.search(r"getElementById\('token'\)\.value\s*=\s*'([^']+)'", html)
            token = token_match.group(1) if token_match else "NOT_FOUND"
            print(f"Extracted Token: {token}")

        post_data = {
            'token': token,
            'Register': ag_number
        }
        
        session.headers.update({'Referer': login_url})
        print(f"Sending POST to {result_url} for {ag_number}...")
        async with session.post(result_url, data=post_data) as resp:
            result_html = await resp.text()
            print(f"Response Status: {resp.status}")
            
            if "You are not authorize" in result_html:
                print("Result: Server returned 'You are not authorize'.")
            elif "Name" in result_html or "Subject" in result_html:
                print("Result: SUCCESS! Real data found.")
                soup = BeautifulSoup(result_html, 'html.parser')
                tables = soup.find_all('table')
                
                if len(tables) >= 2:
                    print("\n--- TABLE 1 ALL ROWS ---")
                    rows = tables[1].find_all('tr')
                    for i, row in enumerate(rows):
                        cols = [td.get_text().strip() for td in row.find_all(['td', 'th'])]
                        print(f"Row {i}: {cols}")
                else:
                    print(f"Only found {len(tables)} tables.")
            else:
                print("Result: Unknown response format.")
                print("Snippet:", result_html[:500])

if __name__ == "__main__":
    asyncio.run(test_live_fetch("2023-ag-10160"))
