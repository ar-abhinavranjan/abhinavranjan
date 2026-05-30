import os

directory = r'q:\AR. Tech\abhinavranjan.qzz.io\devend'
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.html') or file.endswith('.js') or file.endswith('.json'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
            except:
                continue
                
            original_content = content
            content = content.replace('GUEST.AR', 'GUEST. AR')
            content = content.replace('EXPLORE.AR', 'EXPLORE. AR')
            content = content.replace('DASH.AR', 'DASH. AR')
            content = content.replace('DEV.LOGIN', 'DEV. LOGIN')
            
            if file == 'index.html' and root == directory:
                content = content.replace('<link href="https://abhinavranjan.qzz.io/" rel="canonical"/>', '<link href="https://abhinavranjan.qzz.io/devend/index.html" rel="canonical"/>')
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Updated: {filepath}')
