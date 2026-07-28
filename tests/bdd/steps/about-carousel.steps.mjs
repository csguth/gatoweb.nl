// Step definitions for tests/bdd/features/about-carousel.feature
// (js/index/about-carousel.js).
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { When, Then, Given } = createBdd();

When('I click the about carousel next button', async ({ page }) => {
  await clickAndWaitForSettle(page, '#about-carousel-next');
});

When('I click the about carousel next button {int} times', async ({ page }, times) => {
  for (let i = 0; i < times; i += 1) {
    await clickAndWaitForSettle(page, '#about-carousel-next');
  }
});

When('I click the about carousel previous button', async ({ page }) => {
  await clickAndWaitForSettle(page, '#about-carousel-prev');
});

When('I click dot {int} of the about carousel', async ({ page }, dotNumber) => {
  await page.locator('#about-carousel-dots button').nth(dotNumber - 1).click();
  await waitForSettle(page);
});

Given('I use an iPhone-sized viewport', async ({ page }) => {
  // iPhone SE-ish width — the narrowest common viewport, most likely to
  // expose any slide-width/gap mismatch from the carousel's CSS.
  await page.setViewportSize({ width: 375, height: 812 });
});

Then('every about carousel slide exactly fills the track width', async ({ page }) => {
  // Regression guard for the bug where a gap-* utility between shrink-0
  // w-full slides made the track wider than slideCount * trackWidth,
  // desyncing every scroll-snap point from the viewport edge (very visible
  // on iOS Safari, where slides looked clipped/misaligned).
  const { trackWidth, scrollWidth, slideCount } = await page.evaluate(() => {
    const track = document.getElementById('about-carousel-track');
    return {
      trackWidth: track.clientWidth,
      scrollWidth: track.scrollWidth,
      slideCount: track.children.length,
    };
  });
  // Sub-pixel layout rounding can differ by a fraction of a px per slide, so
  // allow up to 1px of drift per slide rather than requiring exact equality.
  expect(Math.abs(scrollWidth - trackWidth * slideCount)).toBeLessThanOrEqual(slideCount);
});

Then('the about carousel is on slide {int} of {int}', async ({ page }, slideNumber, totalSlides) => {
  await expect(page.locator('#about-carousel-dots button')).toHaveCount(totalSlides);
  await expect
    .poll(() => activeSlideIndex(page))
    .toBe(slideNumber - 1);
});

Then('the about carousel shows {string}', async ({ page }, heading) => {
  const activeHeading = await page.evaluate((index) => {
    const slide = document.querySelectorAll('#about-carousel-track > article')[index];
    return slide ? slide.querySelector('h3 .en').textContent.trim() : null;
  }, await activeSlideIndex(page));
  expect(activeHeading).toBe(heading);
});

async function clickAndWaitForSettle(page, selector) {
  await page.locator(selector).click();
  await waitForSettle(page);
}

// The next/prev buttons and dots trigger a smooth scrollIntoView(); the
// IntersectionObserver in about-carousel.js only flips the active dot once
// the scroll animation actually settles, so polling avoids a race with the
// (browser-timed) smooth-scroll animation.
async function waitForSettle(page) {
  await page.waitForTimeout(400);
}

async function activeSlideIndex(page) {
  return page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('#about-carousel-dots button'));
    return dots.findIndex((dot) => dot.getAttribute('aria-selected') === 'true');
  });
}
