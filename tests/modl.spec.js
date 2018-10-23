const express = require("express");
const path = require("path");
const puppeteer = require("puppeteer");

// bootstrap webserver to serve example files
const app = express();

app.use("/examples", express.static(path.resolve(__dirname, "../examples")));
app.use("/dist", express.static(path.resolve(__dirname, "../dist")));

const baseUrl = "http://localhost:58964/";

// global variables
let page;
let browser;
let webserver;
const width = 1920;
const height = 1080;

beforeAll(async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
  page.setViewport({ width, height });

  await startWebserver();
});

afterAll(() => {
  browser.close();
  webserver.close();
});

function startWebserver() {
  return new Promise((resolve, reject) => {
    webserver = app.listen(58964, resolve);
  });
}

function delay(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

describe("basic", () => {
  const app = `${baseUrl}examples/basic.html`;

  test("should open an empty modly with an overlay and a close button, if no parameters are passed", async () => {
    await page.goto(app);

    await delay(300);

    await page.waitForSelector(
      ".modly-wrapper.modly-open .modly.modly-open .modly-content",
      { visible: true }
    );

    await page.screenshot({ path: "images/basic.png" });

    const modlyWrapperStyles = JSON.parse(
      await page.evaluate(() =>
        JSON.stringify(
          getComputedStyle(document.querySelector(".modly-wrapper.modly-open"))
        )
      )
    );
    const modlyStyles = JSON.parse(
      await page.evaluate(() =>
        JSON.stringify(
          getComputedStyle(
            document.querySelector(
              ".modly-wrapper.modly-open .modly.modly-open"
            )
          )
        )
      )
    );
    const modlyContent = await page.evaluate(
      () =>
        document.querySelector(
          ".modly-wrapper.modly-open .modly.modly-open .modly-content"
        ).innerHTML
    );
    const closeButtonContent = await page.evaluate(
      () =>
        document.querySelector(
          ".modly-wrapper.modly-open .modly.modly-open .modly-close"
        ).innerHTML
    );

    expect(modlyWrapperStyles.alignItems).toBe("flex-start");
    expect(modlyWrapperStyles.backgroundColor).toBe("rgba(62, 61, 64, 0.8)");
    expect(modlyWrapperStyles.display).toBe("flex");
    expect(modlyWrapperStyles.justifyContent).toBe("center");

    expect(modlyStyles.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(modlyStyles.width).toBe("900px");

    expect(modlyContent).toBe("");
    expect(closeButtonContent).toBe("×");
  });
});

describe("basic", () => {
  const app = `${baseUrl}examples/no-close-button.html`;

  test("should not render a button, if the closeButton property has been disabled", async () => {
    await page.goto(app);

    await delay(300);

    await page.waitForSelector(
      ".modly-wrapper.modly-open .modly.modly-open .modly-content",
      { visible: true }
    );

    await page.screenshot({ path: "images/no-close-button.png" });

    const closeButtonContent = await page.evaluate(() =>
      document.querySelector(
        ".modly-wrapper.modly-open .modly.modly-open .modly-close"
      )
    );

    expect(closeButtonContent).toBe(null);
  });
});
