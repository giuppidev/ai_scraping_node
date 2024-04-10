import dotenv from "dotenv";
import { chromium } from "playwright";
import OpenAI from "openai";

dotenv.config();

async function scraping() {
  const WEBSITE_URL = "https://news.ycombinator.com/";

  const browser = await chromium.launch();

  const context = await browser.newContext();

  const page = await context.newPage();

  await page.goto(WEBSITE_URL);

  //   const content = await page.innerHTML("body");
  //analyzeContentByText(content);

  const screenshot = await page.screenshot({
    fullPage: true,
    path: "screenshot.png",
  });

  const screenshotBase64 = screenshot.toString("base64");

  await analyzeContentByImage(screenshotBase64);

  browser.close();
}

async function analyzeContentByImage(content) {
  const openai = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
  });

  const message = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Fammi una lista delle 5 informazioni più interessanti, spiegando per ognuna brevemente di cosa si tratta. Torna il risultato come JSON.",
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${content}` },
          },
        ],
      },
    ],
  });

  console.log(message.choices[0].message);
}

async function analyzeContentByText(content) {
  const openai = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
  });

  const message = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "user",
        content: `Questo è l'html di un sito: ${content}. Fammi una lista delle 5 informazioni più interessanti, spiegando per ognuna brevemente di cosa si tratta. Torna il risultato come JSON.`,
      },
    ],
  });

  console.log(message.choices[0].message);
}

scraping();
