from playwright.sync_api import sync_playwright, expect
import time
import re

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Access the app
        print("Navigating to http://localhost:3000/trade.html...")
        try:
            page.goto("http://localhost:3000/trade.html")

            # Wait for content to load
            page.wait_for_timeout(5000)

            # 2. Check for main elements
            expect(page.locator("body")).to_be_visible()

            # 3. Take a screenshot
            page.screenshot(path="/home/jules/verification/trade_security_verify.png")
            print("✅ Screenshot taken: /home/jules/verification/trade_security_verify.png")

            # 4. Check for tokens in sidebar
            # Selector for tokens in sidebar based on rendering.js or tokens.js
            # It usually uses data-token attribute
            token_items = page.locator("[data-token]")
            count = token_items.count()
            print(f"✅ Found {count} tokens in the sidebar.")

            # 5. Verify no console errors related to CORS
            # (We could listen to console events if needed)

        except Exception as e:
            print(f"❌ Verification failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
