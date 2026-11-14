import os
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("File read successfully, length:", len(html))
print("site-header present:", '<header class="site-header">' in html)
print("footer present:", '</footer>' in html)
print("lawyerRegisterForm present:", 'id="lawyerRegisterForm"' in html)
print("script tags present:", 'src="supabase-client.js' in html)
