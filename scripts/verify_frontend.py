from playwright.sync_api import sync_playwright, expect
import time

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Access the app
        print("Navigating to http://localhost:3000...")
        try:
            page.goto("http://localhost:3000")

            # Wait for content to load
            page.wait_for_timeout(3000)

            # 2. Check if we are on the landing page
            expect(page).to_have_title(re.compile("Canonix|Paxi"))
            print("✅ Page title verified.")

            # 3. Check for main elements
            expect(page.locator("body")).to_be_visible()

            # 4. Take a screenshot
            page.screenshot(path="/home/jules/verification/frontend_security_verify.png")
            print("✅ Screenshot taken: /home/jules/verification/frontend_security_verify.png")

            # 5. Check if some API data is loaded (optional but good)
            # We can check if token list is visible
            token_items = page.locator("[data-token]")
            # wait a bit more for async data
            page.wait_for_timeout(2000)
            count = token_items.count()
            print(f"✅ Found {count} tokens in the sidebar.")

        except Exception as e:
            print(f"❌ Verification failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    import re
    run_verification()
