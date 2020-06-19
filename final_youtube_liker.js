//requirements
const fs = require('fs');
const puppeteer = require('puppeteer');
let href = [];
let idx = 0;
let datarequiredFile = process.argv[2];

//work

(async function () {
    let data = await fs.promises.readFile(datarequiredFile, "utf-8");
    let datarequired = JSON.parse(data);
    email = datarequired.email;
    pwd = datarequired.pwd;
    link = datarequired.link;

    try {
        //start browser

        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            slowMo: 100,
            args: ["--start-maximized", '--disable-notifications']    //open in window maximized
        });
        //get array of open pages
        let numberOfPages = await browser.pages();
        let tab = await browser.newPage(); //numberOfPages[0];
        await tab.goto(link);
        await signinplzz(tab);
       

        //select the 1st one

        await tab.goto(`${link}/videos`, { waitUntil: "networkidle0", timeout: 45 * 1000 });
        //await tab2.goto(`${link}/videos`, { waitUntil: "networkidle0", timeout: 45 * 1000 });
        const vidList = await tab.$$('#contents .style-scope.ytd-section-list-renderer a#video-title');
        for (let ele of vidList) {
            let curHref = await tab.evaluate(el => el.getAttribute("href"), ele);
            let curLink = 'https://www.youtube.com' + curHref;
            href.push(curLink);
        }

        while (idx < href.length) {
            await limitTabs(browser, idx, idx + 4);
            idx += 4;
        }
    } catch (err) {
        console.log(err);
    }
})();


async function signinplzz(tab) {
    //sign in
    await tab.waitForSelector('yt-formatted-string#text.style-scope.ytd-button-renderer.style-suggestive.size-small');
    await tab.click("yt-formatted-string#text.style-scope.ytd-button-renderer.style-suggestive.size-small");
    await tab.waitForSelector("input[type='email']");
    await tab.waitFor(3 * 1000);
    await tab.type("input[type='email']", email);//,{ delay: 200 });
    await tab.click("div[role='button'] span");
    await tab.waitForSelector("input[type='password']");
    await tab.waitFor(3 * 1000);
    await tab.type("input[type='password']", pwd)//, { delay: 200 });
    await tab.waitFor(1000);
    await tab.click("span.RveJvd.snByac");
    await tab.waitFor(30 * 1000);
}


//tabsmanage

async function limitTabs(browser, start, end) {
    let limitP = [];
    for (let i = start; i < href.length && i < end; i++) {
        let singlePage = handleSingleVid(browser, href[i]);
        limitP.push(singlePage);
    }
    await Promise.all(limitP);
}


//handlevideohere

async function handleSingleVid(browser, link) {
    return new Promise(async function (resolve, reject) {
        let tab = await browser.newPage();
        await tab.goto(link, { waitUntil: ["networkidle0", "domcontentloaded"], timeout: 60 * 1000 });
        await tab.waitForSelector('.style-scope.ytd-video-primary-info-renderer button#button');
        await tab.click('.style-scope.ytd-video-primary-info-renderer button#button');
        await tab.waitFor(2 * 1000);
        await tab.close();
        resolve();
    })
}