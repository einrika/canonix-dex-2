import asyncio
from playwright.async_api import async_playwright
import os

async def run_verification():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # We need to serve the public directory
        # Since I can't easily start a real server that connects to blockchain,
        # I will just check if the files are correctly linked in index.html

        print("Checking index.html for script inclusions...")
        with open('public/index.html', 'r') as f:
            content = f.read()
            scripts = [
                'js/core/api.js',
                'js/wallet-section/ui-wallet.js',
                'js/ui/rendering.js',
                'js/modules/trade/swap.js',
                'js/modules/trade/liquidity.js'
            ]
            for s in scripts:
                if s in content:
                    print(f"✅ {s} is included")
                else:
                    print(f"❌ {s} is MISSING")

        # Check if renderSwapTerminal is indeed async now
        # I can't easily run JS here without a server, but I verified it with read_file

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_verification())
