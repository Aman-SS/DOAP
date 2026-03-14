const axios = require('axios');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const cheerio = require('cheerio');

async function crawlWebsite(url, selector = null) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            },
            timeout: 30000
        });

        const html = response.data;
        let title = '';
        let extractedContent = '';
        let markdown = '';

        const $ = cheerio.load(html);
        title = $('title').text().trim() || 'Untitled';

        if (selector) {
            extractedContent = $(selector).text().trim();
            markdown = extractedContent; // Basic fallback
        } else {
            // Use Mozilla Readability for auto-extraction
            // Pass the url to JSDOM for relative link resolution
            const dom = new JSDOM(html, { url });
            const reader = new Readability(dom.window.document);
            const article = reader.parse();
            
            if (article) {
                extractedContent = article.textContent.trim();
                markdown = article.content; // Sanitized HTML
                title = article.title || title;
            } else {
                extractedContent = "Could not parse main content automatically.";
            }
        }

        return {
            url,
            title,
            content: extractedContent,
            markdown: markdown
        };

    } catch (error) {
        console.error('Crawl failed:', error);
        throw error;
    }
}

module.exports = { crawlWebsite };
