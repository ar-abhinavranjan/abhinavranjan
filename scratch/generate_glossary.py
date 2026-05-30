import json
import os
from bs4 import BeautifulSoup

terms = [
    # Cybersecurity (20+)
    ("Phishing", "A cyber attack that uses disguised email as a weapon to trick the email recipient into believing that the message is something they want or need.", "Cybersecurity", "fas fa-fish"),
    ("Malware", "Malicious software designed to cause damage to a computer, server, client, or computer network.", "Cybersecurity", "fas fa-bug"),
    ("Ransomware", "A type of malicious software designed to block access to a computer system until a sum of money is paid.", "Cybersecurity", "fas fa-user-secret"),
    ("Encryption", "The process of converting information or data into a code, especially to prevent unauthorized access.", "Cybersecurity", "fas fa-lock"),
    ("Firewall", "A network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules.", "Cybersecurity", "fas fa-shield-alt"),
    ("VPN", "Virtual Private Network, a secure connection between two or more devices across a public network.", "Cybersecurity", "fas fa-network-wired"),
    ("SOC", "Security Operations Center, a centralized unit that deals with security issues on an organizational and technical level.", "Cybersecurity", "fas fa-building"),
    ("SIEM", "Security Information and Event Management, software products and services combining SIM and SEM.", "Cybersecurity", "fas fa-chart-line"),
    ("Zero-Day", "A computer-software vulnerability that is unknown to those who should be interested in mitigating the vulnerability.", "Cybersecurity", "fas fa-calendar-times"),
    ("Penetration Testing", "An authorized simulated cyberattack on a computer system, performed to evaluate the security of the system.", "Cybersecurity", "fas fa-search-shield"),
    ("Social Engineering", "The psychological manipulation of people into performing actions or divulging confidential information.", "Cybersecurity", "fas fa-users"),
    ("DDoS", "Distributed Denial-of-Service attack, a malicious attempt to disrupt normal traffic by overwhelming the target or its surrounding infrastructure.", "Cybersecurity", "fas fa-bomb"),
    ("Trojan", "Any malware which misleads users of its true intent, often hiding malicious code inside seemingly harmless software.", "Cybersecurity", "fas fa-horse-head"),
    ("Botnet", "A number of Internet-connected devices, each of which is running one or more bots, often used to perform DDoS attacks.", "Cybersecurity", "fas fa-robot"),
    ("Keylogger", "A type of surveillance software that has the capability to record every keystroke you make to a log file.", "Cybersecurity", "fas fa-keyboard"),
    ("Spyware", "Software that enables a user to obtain covert information about another's computer activities.", "Cybersecurity", "fas fa-eye"),
    ("Two-Factor Authentication", "A security process in which users provide two different authentication factors to verify themselves.", "Cybersecurity", "fas fa-mobile-alt"),
    ("Vulnerability", "A weakness which can be exploited by a threat actor to cross privilege boundaries within a computer system.", "Cybersecurity", "fas fa-exclamation-triangle"),
    ("Brute Force Attack", "A trial and error method used by application programs to decode encrypted data such as passwords.", "Cybersecurity", "fas fa-hammer"),
    ("Man-in-the-Middle", "An attack where the attacker secretly relays and possibly alters the communication between two parties.", "Cybersecurity", "fas fa-user-ninja"),
    ("Cyber Kill Chain", "A phase-based model to describe the stages of a cyber attack, from early reconnaissance to the goal.", "Cybersecurity", "fas fa-link"),

    # Web Development (20+)
    ("HTML", "HyperText Markup Language, the standard markup language for documents designed to be displayed in a web browser.", "Web Development", "fab fa-html5"),
    ("CSS", "Cascading Style Sheets, a style sheet language used for describing the presentation of a document written in HTML.", "Web Development", "fab fa-css3-alt"),
    ("JavaScript", "A programming language that conforms to the ECMAScript specification, commonly used for web page interactivity.", "Web Development", "fab fa-js"),
    ("API", "Application Programming Interface, a connection between computers or between computer programs.", "Web Development", "fas fa-plug"),
    ("JSON", "JavaScript Object Notation, an open standard file format and data interchange format.", "Web Development", "fas fa-file-code"),
    ("REST API", "An API that conforms to the design principles of the REpresentational State Transfer architectural style.", "Web Development", "fas fa-exchange-alt"),
    ("Frontend", "The client-side part of a website or application that users interact with directly.", "Web Development", "fas fa-desktop"),
    ("Backend", "The server-side of a website or application, responsible for logic, database, and server configuration.", "Web Development", "fas fa-server"),
    ("Full-Stack", "A developer who is comfortable working with both back-end and front-end technologies.", "Web Development", "fas fa-layer-group"),
    ("DOM", "Document Object Model, a cross-platform and language-independent interface that treats an XML or HTML document as a tree structure.", "Web Development", "fas fa-sitemap"),
    ("AJAX", "Asynchronous JavaScript and XML, a set of web development techniques to create asynchronous web applications.", "Web Development", "fas fa-sync"),
    ("Responsive Design", "An approach to web design that makes web pages render well on a variety of devices and window or screen sizes.", "Web Development", "fas fa-mobile-alt"),
    ("Framework", "An abstraction in which software providing generic functionality can be selectively changed by additional user-written code.", "Web Development", "fas fa-cubes"),
    ("Library", "A collection of pre-compiled routines that a program can use.", "Web Development", "fas fa-book"),
    ("Webpack", "An open-source JavaScript module bundler.", "Web Development", "fas fa-box-open"),
    ("NPM", "Node Package Manager, a package manager for the JavaScript programming language.", "Web Development", "fab fa-npm"),
    ("Git", "A distributed version-control system for tracking changes in source code during software development.", "Web Development", "fab fa-git-alt"),
    ("CI/CD", "Continuous Integration and Continuous Delivery/Deployment, practices for automating software development processes.", "Web Development", "fas fa-cogs"),
    ("CORS", "Cross-Origin Resource Sharing, a mechanism that allows restricted resources on a web page to be requested from another domain.", "Web Development", "fas fa-globe"),
    ("WebSockets", "A computer communications protocol, providing full-duplex communication channels over a single TCP connection.", "Web Development", "fas fa-network-wired"),
    ("Single Page Application (SPA)", "A web application that interacts with the user by dynamically rewriting the current web page.", "Web Development", "fas fa-file-alt"),

    # Hosting (20+)
    ("VPS", "Virtual Private Server, a virtual machine sold as a service by an Internet hosting service.", "Hosting", "fas fa-server"),
    ("Shared Hosting", "Web hosting service where many websites reside on one web server connected to the Internet.", "Hosting", "fas fa-share-alt"),
    ("DNS", "Domain Name System, a hierarchical and decentralized naming system for computers, services, or other resources.", "Hosting", "fas fa-globe"),
    ("CDN", "Content Delivery Network, a geographically distributed network of proxy servers and their data centers.", "Hosting", "fas fa-network-wired"),
    ("SSL", "Secure Sockets Layer, a standard security technology for establishing an encrypted link between a server and a client.", "Hosting", "fas fa-lock"),
    ("Reverse Proxy", "A type of proxy server that retrieves resources on behalf of a client from one or more servers.", "Hosting", "fas fa-exchange-alt"),
    ("Bandwidth", "The maximum rate of data transfer across a given path.", "Hosting", "fas fa-tachometer-alt"),
    ("Uptime", "A measure of the time a machine, typically a computer, has been working and available.", "Hosting", "fas fa-clock"),
    ("Dedicated Server", "A type of Internet hosting in which the client leases an entire server not shared with anyone else.", "Hosting", "fas fa-server"),
    ("Cloud Hosting", "Hosting that uses virtual servers that pull their computing resource from extensive underlying networks of physical web servers.", "Hosting", "fas fa-cloud"),
    ("IP Address", "A numerical label assigned to each device connected to a computer network that uses the Internet Protocol for communication.", "Hosting", "fas fa-map-marker-alt"),
    ("DDoS Protection", "Services designed to protect against Distributed Denial-of-Service attacks.", "Hosting", "fas fa-shield-alt"),
    ("Load Balancer", "A device that acts as a reverse proxy and distributes network or application traffic across a number of servers.", "Hosting", "fas fa-balance-scale"),
    ("Colocation", "A data center facility in which a business can rent space for servers and other computing hardware.", "Hosting", "fas fa-building"),
    ("SSH", "Secure Shell, a cryptographic network protocol for operating network services securely over an unsecured network.", "Hosting", "fas fa-terminal"),
    ("FTP", "File Transfer Protocol, a standard network protocol used for the transfer of computer files.", "Hosting", "fas fa-folder-open"),
    ("cPanel", "A web hosting control panel that provides a graphical interface and automation tools.", "Hosting", "fas fa-cogs"),
    ("Database Hosting", "Hosting services specifically optimized for database management systems.", "Hosting", "fas fa-database"),
    ("Backup", "A copy of computer data taken and stored elsewhere so that it may be used to restore the original after a data loss event.", "Hosting", "fas fa-save"),
    ("Latency", "The delay before a transfer of data begins following an instruction for its transfer.", "Hosting", "fas fa-stopwatch"),
    ("Nameserver", "A computer hardware or software server that implements a network service for providing responses to queries against a directory service.", "Hosting", "fas fa-address-book"),

    # AI (20+)
    ("LLM", "Large Language Model, a computational model capable of understanding and generating human language.", "AI", "fas fa-brain"),
    ("Machine Learning", "The study of computer algorithms that improve automatically through experience.", "AI", "fas fa-cogs"),
    ("Neural Network", "A series of algorithms that endeavors to recognize underlying relationships in a set of data.", "AI", "fas fa-network-wired"),
    ("Prompt Engineering", "The process of structuring text that can be interpreted and understood by a generative AI model.", "AI", "fas fa-keyboard"),
    ("RAG", "Retrieval-Augmented Generation, a technique that enhances large language models by retrieving relevant information from an external knowledge base.", "AI", "fas fa-database"),
    ("Fine-Tuning", "The process of making small adjustments to a pre-trained model to optimize its performance for a specific task.", "AI", "fas fa-sliders-h"),
    ("Deep Learning", "Part of a broader family of machine learning methods based on artificial neural networks.", "AI", "fas fa-layer-group"),
    ("Natural Language Processing (NLP)", "A subfield of linguistics, computer science, and AI concerned with the interactions between computers and human language.", "AI", "fas fa-language"),
    ("Computer Vision", "An interdisciplinary scientific field that deals with how computers can gain high-level understanding from digital images or videos.", "AI", "fas fa-eye"),
    ("Generative AI", "A type of AI that can create new content, such as text, images, or audio.", "AI", "fas fa-magic"),
    ("Transformer", "A deep learning architecture that relies entirely on an attention mechanism to draw global dependencies between input and output.", "AI", "fas fa-exchange-alt"),
    ("Tokenization", "The process of breaking down text into smaller units (tokens) for processing by a language model.", "AI", "fas fa-cut"),
    ("Hallucination", "When an AI model generates false, misleading, or nonsensical information that is not based on its training data.", "AI", "fas fa-ghost"),
    ("Embedding", "A relatively low-dimensional space into which high-dimensional vectors may be translated.", "AI", "fas fa-vector-square"),
    ("Inference", "The process of using a trained machine learning model to make predictions on new, unseen data.", "AI", "fas fa-lightbulb"),
    ("Training Data", "The dataset used to train a machine learning algorithm.", "AI", "fas fa-database"),
    ("Algorithm", "A sequence of instructions that are carried out to perform a specific task.", "AI", "fas fa-code"),
    ("Bias", "Systematic and unfair discrimination in AI models resulting from prejudiced assumptions in the algorithm or training data.", "AI", "fas fa-balance-scale-left"),
    ("Reinforcement Learning", "An area of machine learning concerned with how intelligent agents ought to take actions in an environment to maximize cumulative reward.", "AI", "fas fa-gamepad"),
    ("Supervised Learning", "The machine learning task of learning a function that maps an input to an output based on example input-output pairs.", "AI", "fas fa-chalkboard-teacher"),
    ("Unsupervised Learning", "Machine learning that looks for previously undetected patterns in a dataset with no pre-existing labels.", "AI", "fas fa-search"),

    # Luminary Ecosystem (20+)
    ("Luminary Technicals", "Futuristic technology ecosystem founded by AR. Abhinav Ranjan, focusing on secure digital infrastructure.", "Luminary Ecosystem", "fas fa-network-wired"),
    ("Luminary Servers", "High-performance, secure hosting infrastructure provided by the Luminary ecosystem.", "Luminary Ecosystem", "fas fa-server"),
    ("Luminary Developers", "The collaborative development community working on Luminary Technicals projects.", "Luminary Ecosystem", "fas fa-code-branch"),
    ("Luminary Cares", "The social responsibility and ethical technology initiative within the Luminary ecosystem.", "Luminary Ecosystem", "fas fa-heart"),
    ("Luminary Kits", "Pre-packaged toolsets and libraries designed for rapid secure application development.", "Luminary Ecosystem", "fas fa-toolbox"),
    ("Luminary Webs", "Web development division focused on creating highly optimized, secure, and modern websites.", "Luminary Ecosystem", "fas fa-globe"),
    ("DevEnd", "Behind-the-scenes administrative portal and local developer management suite.", "Luminary Ecosystem", "fas fa-terminal"),
    ("LTS Platform", "Live Telecast Server, providing RTC-based real-time podcast telecasts and Q&A rooms.", "Luminary Ecosystem", "fas fa-broadcast-tower"),
    ("AgroScan AI", "Advanced agricultural disease scanner using AI and deep learning to protect crops.", "Luminary Ecosystem", "fas fa-robot"),
    ("AR Tech", "The foundational technology initiative started in 2019 that evolved into Luminary Technicals.", "Luminary Ecosystem", "fas fa-history"),
    ("itzmeabhinavranjan", "Primary alternative digital alias and developer handle used by Abhinav Ranjan.", "Luminary Ecosystem", "fas fa-id-badge"),
    ("Biographical Library", "Custom educational resources section containing downloadable security sheets.", "Luminary Ecosystem", "fas fa-book-reader"),
    ("Digital Sovereignty", "The core philosophy of the Luminary Ecosystem, emphasizing control over one's own digital destiny.", "Luminary Ecosystem", "fas fa-crown"),
    ("SecSDLC", "Security-First Development Lifecycle, the rigorous framework used for all Luminary development.", "Luminary Ecosystem", "fas fa-shield-alt"),
    ("Proactive Defense", "The methodology used across Luminary platforms to anticipate and neutralize threats.", "Luminary Ecosystem", "fas fa-shield-virus"),
    ("Ecosystem Matrix", "The interconnected network of services, platforms, and databases within Luminary Technicals.", "Luminary Ecosystem", "fas fa-project-diagram"),
    ("GAS Backend", "Global Administrative System backend, the central orchestration layer for Luminary services.", "Luminary Ecosystem", "fas fa-cogs"),
    ("Luminary Auth", "The centralized, secure authentication service used across all Luminary platforms.", "Luminary Ecosystem", "fas fa-key"),
    ("Cyber Jurisprudence Initiative", "A research branch within Luminary focused on the intersection of law and technology.", "Luminary Ecosystem", "fas fa-balance-scale"),
    ("Resilient Frontier", "The ultimate goal of the Luminary Ecosystem: building unshakeable digital infrastructure.", "Luminary Ecosystem", "fas fa-fort-awesome"),
    ("Tech-Democratization", "The process of making high-level security knowledge accessible to everyone, a core Luminary value.", "Luminary Ecosystem", "fas fa-users")
]

template_path = "q:/AR. Tech/abhinavranjan.qzz.io/frontend/html/moredetails/glossary.html"
output_path = "q:/AR. Tech/abhinavranjan.qzz.io/frontend/html/glossary.html"

with open(template_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

# Update title and meta
if soup.title:
    soup.title.string = "Comprehensive Glossary — Abhinav Ranjan"

# Fix canonical
canonical = soup.find('link', rel='canonical')
if canonical:
    canonical['href'] = 'https://abhinavranjan.qzz.io/frontend/html/glossary.html'

# Fix og:url
og_url = soup.find('meta', property='og:url')
if og_url:
    og_url['content'] = 'https://abhinavranjan.qzz.io/frontend/html/glossary.html'

# Fix H1 (ensure only 1, the template has one)
h1 = soup.find('h1')
if h1:
    h1.string = "Comprehensive Glossary"

# Fix relative paths from ../../../ to ../../
for tag in soup.find_all(['link', 'a', 'img', 'script']):
    if tag.name == 'link' and tag.has_attr('href'):
        tag['href'] = tag['href'].replace('../../../', '../../').replace('../../css/', '../css/')
    if tag.name == 'a' and tag.has_attr('href'):
        tag['href'] = tag['href'].replace('../../../', '../../').replace('../about.html', 'about.html').replace('../projects.html', 'projects.html').replace('../biography.html', 'biography.html').replace('../socials.html', 'socials.html').replace('../winnings.html', 'winnings.html').replace('../contact.html', 'contact.html')
    if tag.name == 'img' and tag.has_attr('src'):
        tag['src'] = tag['src'].replace('../../../', '../../')
    if tag.name == 'script' and tag.has_attr('src'):
        tag['src'] = tag['src'].replace('../../logic/', '../logic/')

# Add breadcrumb schema
breadcrumb_schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://abhinavranjan.qzz.io/"
  },{
    "@type": "ListItem",
    "position": 2,
    "name": "Glossary",
    "item": "https://abhinavranjan.qzz.io/frontend/html/glossary.html"
  }]
}
new_script = soup.new_tag('script', type='application/ld+json')
new_script.string = json.dumps(breadcrumb_schema, indent=2)
soup.head.append(new_script)

# Clear old glossary grid and add new terms
grid = soup.find('div', class_='glossary-grid')
if grid:
    grid.clear()
    
    for idx, term in enumerate(terms):
        name, desc, category, icon = term
        
        card = soup.new_tag('div', class_='glossary-card fade-in-up delay-' + str((idx%5)*50 + 200))
        h3 = soup.new_tag('h3')
        i = soup.new_tag('i', class_=icon)
        h3.append(i)
        h3.append(" " + name)
        
        p = soup.new_tag('p')
        p.string = desc
        
        badge = soup.new_tag('span', class_='category-badge')
        badge.string = category
        
        card.append(h3)
        card.append(p)
        card.append(badge)
        grid.append(card)

# Write out the new glossary
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(str(soup))
    
print(f"Generated glossary with {len(terms)} terms at {output_path}")
