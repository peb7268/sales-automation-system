const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Competitor websites to capture
const competitors = [
    {
        url: 'https://overheaddoordenver.com/',
        name: 'overhead-door-denver',
        company: 'Overhead Door Company of Denver'
    },
    {
        url: 'https://www.cologaragedoor.com/',
        name: 'colorado-garage-door-service', 
        company: 'Colorado Garage Door Service'
    },
    {
        url: 'https://donsgaragedoors.com/',
        name: 'dons-garage-doors',
        company: "Don's Garage Doors"
    }
];

// Base directory for competitor analysis
const baseDir = '/Users/pbarrick/Documents/Main/Projects/Sales/Prospects/smart-garage-door-service/competitors';

async function captureScreenshots() {
    console.log('🎯 Starting competitor screenshot capture...');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const competitor of competitors) {
        console.log(`\n📸 Capturing screenshots for ${competitor.company}...`);
        
        try {
            // Desktop Screenshot (1920x1080)
            console.log(`   📱 Capturing desktop view...`);
            const desktopPage = await browser.newPage();
            await desktopPage.setViewport({ width: 1920, height: 1080 });
            await desktopPage.goto(competitor.url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            
            // Wait for page to fully load
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const desktopPath = path.join(baseDir, competitor.name, `${competitor.name}-desktop.png`);
            await desktopPage.screenshot({ 
                path: desktopPath, 
                fullPage: true,
                type: 'png'
            });
            console.log(`   ✅ Desktop screenshot saved: ${desktopPath}`);
            await desktopPage.close();

            // Mobile Screenshot (iPhone 16 Pro: 393x852)
            console.log(`   📱 Capturing mobile view...`);
            const mobilePage = await browser.newPage();
            await mobilePage.setViewport({ width: 393, height: 852 });
            await mobilePage.goto(competitor.url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            
            // Wait for page to fully load
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const mobilePath = path.join(baseDir, competitor.name, `${competitor.name}-mobile.png`);
            await mobilePage.screenshot({ 
                path: mobilePath, 
                fullPage: true,
                type: 'png'
            });
            console.log(`   ✅ Mobile screenshot saved: ${mobilePath}`);
            await mobilePage.close();

        } catch (error) {
            console.error(`   ❌ Error capturing ${competitor.company}: ${error.message}`);
        }
    }

    await browser.close();
    console.log('\n🎉 Screenshot capture completed!');
}

// Run the capture
captureScreenshots().catch(error => {
    console.error('❌ Screenshot capture failed:', error);
    process.exit(1);
});