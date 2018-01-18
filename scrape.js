'use strict';

const Aigle = require('aigle');
const puppeteer = require('puppeteer');

const url = 'https://www.google.co.jp/search?tbm=nws&q=%E7%9D%A1%E7%9C%A0%E3%80%80%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B9';
const words = [
  '不足',
  '病気',
  '原因'
];
const re = new RegExp(words.join('|'));

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // set logal storage
  let count = 0;
  const tester = list => !list.length && ++count < 1;
  const iterator = async () => {
    const u = count ? `${url}&start=${count*10}` : url;
    const list = await getResult(u);
    return list.filter(({ innerText }) => re.test(innerText));
  }
  const result = await Aigle.doWhilst(iterator, tester);
  await browser.close();

  if (!result.length) {
    return console.log('Not found');
  }
  const [{ href, innerText }] = result;
  const text = `${innerText}\n${href}`;
  console.log(text);
  return text;

  async function getResult(url) {
    await page.goto(url);
    return await page.evaluate(() => {
      const nodeList = document.querySelectorAll('._PMs');
      const result = [];
      nodeList.forEach(({ href, innerText }) => result.push({
        href,
        innerText
      }));
      return result;
    });
  }
})();

