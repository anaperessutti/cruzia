"""Browser regression checks for shared filters and router scroll restoration."""
import asyncio
from playwright.async_api import async_playwright


async def check_navigation():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 1800})
        await page.goto("http://localhost:8080", wait_until="networkidle")
        await page.evaluate("window.scrollTo(0, 1200)")
        await page.wait_for_timeout(200)
        await page.evaluate("window.scrollBy(0, -100)")
        await page.wait_for_timeout(350)
        saved = await page.evaluate("scrollY")
        await page.get_by_role("button", name="Abrir menú").click()
        await page.get_by_role("navigation", name="Navegación principal").get_by_role("link", name="Cupones", exact=True).click()
        await page.wait_for_url("**/cupones")
        await page.wait_for_timeout(400)
        assert await page.evaluate("scrollY") == 0, "New navigation must start at the top"
        assert await page.get_by_role("switch").first.get_attribute("aria-checked") == "true"
        await page.go_back(wait_until="networkidle")
        await page.wait_for_timeout(400)
        assert await page.evaluate("scrollY") == saved, "Back must restore the previous scroll position"
        await page.evaluate("window.scrollBy(0, -100)")
        await page.wait_for_timeout(350)
        await page.get_by_role("button", name="Abrir menú").click()
        await page.get_by_role("navigation", name="Navegación principal").get_by_role("link", name="Cupones", exact=True).click()
        await page.wait_for_url("**/cupones")
        await page.wait_for_timeout(400)
        await page.get_by_role("button", name="Abrir menú").click()
        await page.get_by_role("button", name="Categorías de Rubros").click()
        await page.get_by_role("link", name="Ver todas", exact=True).click()
        await page.wait_for_url("**/categorias")
        await page.wait_for_timeout(400)
        assert await page.get_by_role("switch").first.get_attribute("aria-checked") == "false", "Leaving Coupons must clear coupon-only filtering"
        await page.get_by_role("switch").first.click()
        assert await page.get_by_role("switch").first.get_attribute("aria-checked") == "true", "Categories must retain its working coupon switch"
        await browser.close()
        print("Navigation and filter regressions passed")


if __name__ == "__main__":
    asyncio.run(check_navigation())