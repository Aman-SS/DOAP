const { chromium } = require('playwright');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const cheerio = require('cheerio');

async function crawlWebsite(url, selector = null) {
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        const page = await context.newPage();
        
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Wait for potential dynamic content
        await page.waitForTimeout(2000);

        const html = await page.content();
        const title = await page.title();

        let extractedContent = '';
        let markdown = '';

        if (selector) {
            const $ = cheerio.load(html);
            extractedContent = $(selector).text().trim();
            markdown = extractedContent; // Basic fallback
        } else {
            // Use Mozilla Readability for auto-extraction
            const dom = new JSDOM(html, { url });
            const reader = new Readability(dom.window.document);
            const article = reader.parse();
            
            if (article) {
                extractedContent = article.textContent.trim();
                markdown = article.content; // This is the sanitized HTML
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
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { crawlWebsite };
