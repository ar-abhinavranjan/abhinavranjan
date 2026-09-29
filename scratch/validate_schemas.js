const fs = require('fs');

function testJsonFile(path) {
  try {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    console.log('✅ ' + path + ' is valid JSON.');
  } catch (err) {
    console.error('❌ ' + path + ' failed: ' + err.message);
  }
}

function testHtmlLdJson(path) {
  try {
    const content = fs.readFileSync(path, 'utf8');
    const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let index = 0;
    while ((match = regex.exec(content)) !== null) {
      index++;
      try {
        JSON.parse(match[1].trim());
        console.log('✅ ' + path + ' [Script ' + index + '] JSON-LD is valid.');
      } catch (e) {
        console.error('❌ ' + path + ' [Script ' + index + '] JSON-LD error: ' + e.message);
      }
    }
  } catch (err) {
    console.error('❌ ' + path + ' failed to read: ' + err.message);
  }
}

testJsonFile('frontend/data/blogs.json');
testJsonFile('frontend/data/asked_questions_page.json');
testHtmlLdJson('index.html');
testHtmlLdJson('frontend/html/moredetails/asked-questions.html');
testHtmlLdJson('frontend/blogs/content/ar-honorific-origin.html');
