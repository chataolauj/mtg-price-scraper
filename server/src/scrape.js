const puppeteer = require('puppeteer');

async function scrapeTCG(card_name, set_name, isFoil) {
    const url = `https://shop.tcgplayer.com/magic/${set_name.toLowerCase().replace(/:?,?\s+/g, "-")}/${card_name.toLowerCase().replace(/:?,?\s+/g, '-')}`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080});
    await page.goto(url, { waitUntil: 'networkidle2'});
    
    let website = {
        website: 'TCGPlayer',
        url: url,
        listings: []
    };

    try {
        product_listings = await page.evaluate((isFoil) => {
            let conditions = Array.from(document.querySelectorAll('div.product-listing .condition')).map(condition => condition.innerText);
            let prices = Array.from(document.querySelectorAll('div.product-listing .product-listing__price')).map(price => +price.innerText.replace(/\$/g, ''));
            let shipping_costs = Array.from(document.querySelectorAll('div.product-listing .product-listing__shipping')).map(shipping => +shipping.innerText.replace(/[^\d.]/g, ""));
            let quantity = Array.from(document.querySelectorAll('div.product-listing .product-listing__qty-available')).map(quantity => +quantity.innerText.replace(/\D/g, ""));

            let listings = [];

            for(let i = 0; i < prices.length; i++) {
                if(shipping_costs[i] === 35) {
                    shipping_costs[i] = 1.99;
                }

                if(shipping_costs[i] === 0.785) {
                    shipping_costs[i] = 0.78;
                }
                
                let listing = {
                    condition: conditions[i],
                    usd: prices[i],
                    usd_foil: isFoil ? 33.87 : null,
                    shipping: shipping_costs[i],
                    qty: quantity[i],
                    total_price: (prices[i] + shipping_costs[i]).toFixed(2)
                };

                listings.push(listing);
            }

            return listings;
        }, isFoil);

        website.listings = product_listings;

    } catch(err) {
        console.log(err);
    }
    
    await browser.close();

    return website;
}

async function getWebsites(card_name, set_name, isFoil) {
    let websites = [];

    let tcgplayer = await scrapeTCG(card_name, set_name, isFoil);
    websites.push(tcgplayer);

    return websites;
}

module.exports = {
    getWebsites
}