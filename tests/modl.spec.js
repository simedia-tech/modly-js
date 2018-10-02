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
  browser = await puppeteer.launch({ headless: false });
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

  test("should open an empty modl with an overlay and a close button, if no parameters are passed", async () => {
    await page.goto(app);

    await delay(300);

    await page.waitForSelector(
      ".modl-wrapper.modl-open .modl.fade.modl-open .modl-content",
      { visible: true }
    );

    await page.screenshot({ path: "images/basic.png" });

    const modlWrapperStyles = JSON.parse(
      await page.evaluate(() =>
        JSON.stringify(
          getComputedStyle(document.querySelector(".modl-wrapper.modl-open"))
        )
      )
    );
    const modlStyles = JSON.parse(
      await page.evaluate(() =>
        JSON.stringify(
          getComputedStyle(
            document.querySelector(
              ".modl-wrapper.modl-open .modl.fade.modl-open"
            )
          )
        )
      )
    );
    const modlContent = await page.evaluate(
      () =>
        document.querySelector(
          ".modl-wrapper.modl-open .modl.fade.modl-open .modl-content"
        ).innerHTML
    );
    const closeButtonContent = await page.evaluate(
      () =>
        document.querySelector(
          ".modl-wrapper.modl-open .modl.fade.modl-open .modl-close"
        ).innerHTML
    );

    expect(modlWrapperStyles.alignItems).toBe("center");
    expect(modlWrapperStyles.backgroundColor).toBe("rgba(62, 61, 64, 0.8)");
    expect(modlWrapperStyles.display).toBe("flex");
    expect(modlWrapperStyles.justifyContent).toBe("center");

    expect(modlStyles.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(modlStyles.width).toBe("900px");

    expect(modlContent).toBe("");
    expect(closeButtonContent).toBe("×");
  });
});

describe("basic", () => {
  const app = `${baseUrl}examples/no-close-button.html`;

  test("should not render a button, if the closeButton property has been disabled", async () => {
    await page.goto(app);

    await delay(300);

    await page.waitForSelector(
      ".modl-wrapper.modl-open .modl.fade.modl-open .modl-content",
      { visible: true }
    );

    await page.screenshot({ path: "images/no-close-button.png" });

    const closeButtonContent = await page.evaluate(() =>
      document.querySelector(
        ".modl-wrapper.modl-open .modl.fade.modl-open .modl-close"
      )
    );

    expect(closeButtonContent).toBe(null);
  });
});
