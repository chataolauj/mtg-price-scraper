const cron = require('node-cron');
const ScrapeList = require('../models/ScrapeList');
const db = require('../db/db');
const { getWebsites } = require('./scrape')

async function main() {
    let scrape_list = await getScrapeList();

    if(scrape_list.length) {
        for(let card of scrape_list) {
            console.log(card.name)
            card.websites = await getWebsites(card.name, card.set_name, false);
    
            if(card.websites[0].listings.length) {
                
                await ScrapeList.updateOne(
                    {name: card.name, set_name: card.set_name},
                    {$set: {websites: card.websites}}
                );
            }
        }
    }
    
}

async function getScrapeList() {
    let scrape_list = await ScrapeList.find(
        { "notify_list.0": { $exists: true } }
    )

    return scrape_list;
}

console.log('Running scrape schedule...')
 
cron.schedule('* */4 * * *', async () => {
    await db.connect();
    await main();
    db.disconnect();
});