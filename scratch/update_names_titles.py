import os
import re

directory = r'q:\AR. Tech\abhinavranjan.qzz.io'

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        return

    original_content = content

    # 1. Name space fixes
    # Replace AR.Abhinav with AR. Abhinav
    content = content.replace("AR.Abhinav", "AR. Abhinav")
    # Replace AR.Tech with AR. Tech
    content = content.replace("AR.Tech", "AR. Tech")
    content = content.replace("AR.TECH", "AR. Tech")
    content = content.replace("DEV.AR", "DEV. AR")
    
    # Also handle some edge cases if they exist
    content = content.replace("AR. Tech|", "AR. Tech |")
    content = content.replace("AR. Tech |", "AR. Tech | ")

    # 2. Title updates (only for HTML)
    if filepath.endswith('.html'):
        # Fix missing titles
        if '<title>AR. Abhinav Ranjan</title>' in content:
            if 'about.html' in filepath:
                content = content.replace('<title>AR. Abhinav Ranjan</title>', '<title>About | AR. Abhinav Ranjan</title>')
            elif 'projects.html' in filepath:
                content = content.replace('<title>AR. Abhinav Ranjan</title>', '<title>Projects | AR. Abhinav Ranjan</title>')
            elif 'biography.html' in filepath:
                content = content.replace('<title>AR. Abhinav Ranjan</title>', '<title>Biography | AR. Abhinav Ranjan</title>')
            elif 'index.html' in filepath:
                content = content.replace('<title>AR. Abhinav Ranjan</title>', '<title>AR. Abhinav Ranjan | Cybersecurity & Dev Portfolio</title>')
        
        # Clean up double spaces just in case
        content = content.replace('  ', ' ')

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk(directory):
    if 'node_modules' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith('.html') or file.endswith('.json') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            process_file(filepath)

print("Scan and update completed.")
