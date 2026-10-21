import unittest
import urllib.request
import threading
import time
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import run

PORT = 5098

class TestUIAssets(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = threading.Thread(target=run, kwargs={"port": PORT, "host": "127.0.0.1"}, daemon=True)
        cls.server.start()
        time.sleep(0.5)

    def test_routes(self):
        routes = ["/", "/index.html", "/css/styles.css", "/js/app.js", "/js/map.js", "/js/audio.js", "/api/status", "/api/assets"]
        for r in routes:
            url = f"http://127.0.0.1:{PORT}{r}"
            with urllib.request.urlopen(url) as resp:
                self.assertEqual(resp.status, 200)

    def test_light_theme_default(self):
        with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/index.html") as resp:
            html = resp.read().decode('utf-8')
            self.assertIn('data-theme="light"', html)
            self.assertIn('id="theme-label" class="theme-text">Light</span>', html)

        with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/css/styles.css") as resp:
            css = resp.read().decode('utf-8')
            self.assertIn('#F3F4F8', css)
            self.assertIn('#7557E8', css)
            self.assertIn('#18A77A', css)
            self.assertIn('#E5485D', css)

    def test_layout_sizing_and_icon_system(self):
        with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/css/styles.css") as resp:
            css = resp.read().decode('utf-8')
            # Verify spacing scale and layout tokens
            self.assertIn('--space-1: 4px;', css)
            self.assertIn('--space-6: 24px;', css)
            self.assertIn('--sidebar-width: 270px;', css)
            self.assertIn('--topbar-height: 74px;', css)
            self.assertIn('--control-height: 42px;', css)
            self.assertIn('--kpi-icon-size: 38px;', css)
            # Verify 5-column KPI grid
            self.assertIn('grid-template-columns: repeat(5, minmax(0, 1fr));', css)
            # Verify topology container aspect-ratio
            self.assertIn('aspect-ratio: 900 / 480;', css)
            # Verify responsive queries
            self.assertIn('@media (max-width: 1400px)', css)
            self.assertIn('@media (max-width: 1024px)', css)
            self.assertIn('@media (max-width: 768px)', css)
            self.assertIn('@media (max-width: 480px)', css)

        with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/index.html") as resp:
            html = resp.read().decode('utf-8')
            # Verify KPI card icons are standardized SVGs in .kpi-icon-pill containers
            self.assertIn('class="kpi-icon-pill success"', html)
            self.assertIn('class="kpi-icon-pill critical"', html)
            self.assertIn('class="kpi-icon-pill info"', html)
            self.assertIn('class="kpi-icon-pill warning"', html)
            # Verify sector filter pills have filter-icon wrappers
            self.assertIn('class="filter-icon"', html)
            # Verify Defense Highlights has aligned SVG header
            self.assertIn('class="defense-highlight-header"', html)

if __name__ == "__main__":
    unittest.main()
