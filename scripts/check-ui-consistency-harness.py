#!/usr/bin/env python3
"""Render the shared core workspaces and fail on runtime or horizontal-overflow regressions."""

import html
import http.server
import json
import os
import re
import shutil
import socketserver
import struct
import subprocess
import tempfile
import threading
import time
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = PROJECT_ROOT / 'dist'
REPORTS_DIR = PROJECT_ROOT / 'reports'
ARTIFACT_DIR = REPORTS_DIR / 'ui-consistency'
REPORT_PATH = REPORTS_DIR / 'uiConsistencyHarness.json'
PROBE_PATH = DIST_DIR / '__ui_consistency_probe.html'
PORT = 0

ROUTES = [
    {
        'id': 'party',
        'hash': '#/party',
        'selectors': ['#root', '.manage-entry-grid', '.party-member-card'],
    },
    {
        'id': 'matchup',
        'hash': '#/single?tab=party',
        'selectors': [
            '#root',
            '.quick-damage.single-workspace',
            '.unified-pair-pickers',
            '.quick-speed-comparison-card',
            '.quick-sides',
        ],
    },
    {
        'id': 'calculator',
        'hash': '#/damage',
        'selectors': [
            '#root',
            '.quick-damage:not(.single-workspace)',
            '.quick-speed-comparison-card',
            '.quick-sides',
        ],
    },
    {
        'id': 'sample-builder',
        'hash': '#/sample-builder',
        'selectors': [
            '#root',
            '#sample-builder-section',
            '#sample-builder-card',
            '#sample-builder-card .quick-compact-stat-editor',
            '#sample-moves-card',
            '#sample-moves-card .move-slots-editor',
        ],
    },
]

VIEWPORTS = [
    {'id': 'desktop', 'width': 1440, 'height': 2200},
    {'id': 'mobile', 'width': 390, 'height': 2200},
]

ERROR_CAPTURE = """<script>
window.__UI_HARNESS_ERRORS__ = [];
window.addEventListener('error', function (event) {
  window.__UI_HARNESS_ERRORS__.push(String(event.message || event.error || 'window error'));
});
window.addEventListener('unhandledrejection', function (event) {
  window.__UI_HARNESS_ERRORS__.push(String(event.reason || 'unhandled rejection'));
});
</script>"""

INDEX_SOURCE = (DIST_DIR / 'index.html').read_text(encoding='utf-8') if (DIST_DIR / 'index.html').exists() else ''
ABSOLUTE_ASSET = re.search(r'''(?:src|href)=["'](/(?:[^"']*/)?assets/)''', INDEX_SOURCE)
BUILD_BASE = ABSOLUTE_ASSET.group(1)[:-len('assets/')] if ABSOLUTE_ASSET else '/'

PROBE_DOCUMENT = """<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>UI consistency probe</title></head>
<body>
<pre id="probe">{"ready":false}</pre>
<script>
(() => {
  const params = new URLSearchParams(location.search);
  const target = params.get('target') || '#/';
  const selectors = JSON.parse(params.get('selectors') || '[]');
  const requestedWidth = Math.max(1, Number(params.get('width')) || window.innerWidth);
  const requestedHeight = Math.max(1, Number(params.get('height')) || window.innerHeight);
  const output = document.getElementById('probe');
  const frame = document.createElement('iframe');
  frame.id = 'target';
  frame.style.cssText = `position:fixed;inset:0;width:${requestedWidth}px;height:${requestedHeight}px;border:0`;
  document.body.append(frame);
  let polling = false;
  const sample = () => {
    try {
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      const root = doc.documentElement;
      const body = doc.body;
      const clientWidth = root.clientWidth;
      const scrollWidth = Math.max(root.scrollWidth, body ? body.scrollWidth : 0);
      const missingSelectors = selectors.filter(selector => !doc.querySelector(selector));
      output.textContent = JSON.stringify({
        ready: doc.readyState === 'complete',
        title: doc.title,
        hash: win.location.hash,
        viewportWidth: win.innerWidth,
        clientWidth,
        scrollWidth,
        horizontalOverflow: scrollWidth > clientWidth,
        missingSelectors,
        runtimeErrors: Array.isArray(win.__UI_HARNESS_ERRORS__) ? win.__UI_HARNESS_ERRORS__ : [],
      });
    } catch (error) {
      output.textContent = JSON.stringify({ready: false, probeError: String(error)});
    }
  };
  const pollUntilDeadline = () => {
    if (polling) return;
    polling = true;
    const deadline = Date.now() + 6500;
    const poll = () => {
      sample();
      if (Date.now() >= deadline) {
        document.body.dataset.ready = 'true';
        return;
      }
      window.setTimeout(poll, 250);
    };
    poll();
  };
  frame.addEventListener('load', pollUntilDeadline, {once: true});
  frame.src = '/?__ui_harness=1' + target;
  window.setTimeout(() => {
    if (!polling) {
      output.textContent = JSON.stringify({ready: false, probeError: 'target frame did not load'});
      document.body.dataset.ready = 'true';
    }
  }, 7000);
})();
</script>
</body>
</html>
"""


def find_chromium() -> str:
    env_binary = os.environ.get('CHROME_BIN')
    command_names = [
        'chromium-browser',
        'chromium',
        'google-chrome',
        'google-chrome-stable',
        'chrome',
    ]
    application_paths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    ]
    candidates = [env_binary] if env_binary else []
    candidates.extend(shutil.which(name) for name in command_names)
    candidates.extend(application_paths)
    for candidate in candidates:
        if candidate and Path(candidate).is_file() and os.access(candidate, os.X_OK):
            return str(candidate)
    raise SystemExit('Chromium 계열 브라우저를 찾지 못했습니다. CHROME_BIN을 지정하세요.')


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, _format, *_args):
        return

    def do_GET(self):
        request = urlparse(self.path)
        if BUILD_BASE != '/' and (request.path == BUILD_BASE.rstrip('/') or request.path.startswith(BUILD_BASE)):
            stripped_path = request.path[len(BUILD_BASE.rstrip('/')):] or '/'
            self.path = stripped_path + (f'?{request.query}' if request.query else '')
            request = urlparse(self.path)
        instrumented = '__ui_harness' in parse_qs(request.query)
        if instrumented and request.path in ('/', '/index.html'):
            source = (DIST_DIR / 'index.html').read_text(encoding='utf-8')
            source = source.replace('<head>', f'<head>{ERROR_CAPTURE}', 1)
            encoded = source.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)
            return
        super().do_GET()


def extract_probe(document: str) -> dict:
    match = re.search(r'<pre id="probe">(.*?)</pre>', document, re.S)
    if not match:
        raise RuntimeError('probe result was not rendered')
    return json.loads(html.unescape(match.group(1)))


def png_dimensions(path: Path) -> tuple[int, int]:
    with path.open('rb') as image:
        if image.read(8) != b'\x89PNG\r\n\x1a\n':
            raise ValueError(f'not a PNG: {path}')
        image.read(8)
        return struct.unpack('>II', image.read(8))


if not DIST_DIR.exists():
    raise SystemExit('dist 폴더가 없습니다. 먼저 npm run build 를 실행하세요.')

REPORT_PATH.unlink(missing_ok=True)
shutil.rmtree(ARTIFACT_DIR, ignore_errors=True)
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
browser_binary = find_chromium()
PROBE_PATH.write_text(PROBE_DOCUMENT, encoding='utf-8')

os.chdir(DIST_DIR)
httpd = socketserver.TCPServer(('127.0.0.1', PORT), QuietHandler)
actual_port = httpd.server_address[1]
thread = threading.Thread(target=httpd.serve_forever, daemon=True)
thread.start()
time.sleep(.25)

report = {
    'generatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    'source': 'Chromium headless DOM/overflow/screenshot harness',
    'browser': Path(browser_binary).name,
    'routes': [],
    'summary': {'passed': 0, 'failed': 0},
}

with tempfile.TemporaryDirectory(prefix='pokemon-champions-ui-') as profile_dir:
    def run_chromium(args, capture_stdout=True):
        command = [
            browser_binary,
            '--headless=new',
            '--disable-background-networking',
            '--disable-component-update',
            '--disable-default-apps',
            '--disable-extensions',
            '--disable-gpu',
            '--disable-sync',
            '--force-device-scale-factor=1',
            '--metrics-recording-only',
            '--no-first-run',
            '--no-sandbox',
            '--password-store=basic',
            '--use-mock-keychain',
            f'--user-data-dir={profile_dir}',
            *args,
        ]
        return subprocess.run(
            command,
            cwd=PROJECT_ROOT,
            text=True,
            stdout=subprocess.PIPE if capture_stdout else subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            timeout=60,
            check=True,
        )

    try:
        for route in ROUTES:
            route_result = {'id': route['id'], 'hash': route['hash'], 'viewports': [], 'ok': True}
            for viewport in VIEWPORTS:
                query = urlencode({
                    'target': route['hash'],
                    'selectors': json.dumps(route['selectors'], separators=(',', ':')),
                    'width': viewport['width'],
                    'height': viewport['height'],
                })
                probe_url = f'http://127.0.0.1:{actual_port}/{PROBE_PATH.name}?{query}'
                screenshot_url = probe_url
                screenshot_path = ARTIFACT_DIR / f'{route["id"]}-{viewport["id"]}.png'
                checks = []
                browser_width = viewport['width']
                try:
                    document = run_chromium([
                        f'--window-size={browser_width},{viewport["height"]}',
                        '--virtual-time-budget=8000',
                        '--dump-dom',
                        probe_url,
                    ]).stdout
                    metrics = extract_probe(document)
                    checks.extend([
                        {
                            'name': 'document ready',
                            'pass': metrics.get('ready') is True,
                            'detail': 'ok' if metrics.get('ready') is True else metrics.get('probeError', 'document did not finish loading'),
                        },
                        {
                            'name': 'requested viewport',
                            'pass': metrics.get('viewportWidth') == viewport['width'],
                            'detail': f'expected {viewport["width"]}, got {metrics.get("viewportWidth")}',
                        },
                        {
                            'name': 'core surfaces',
                            'pass': not metrics.get('missingSelectors'),
                            'detail': 'ok' if not metrics.get('missingSelectors') else f'missing: {", ".join(metrics["missingSelectors"])}',
                        },
                        {
                            'name': 'runtime errors',
                            'pass': not metrics.get('runtimeErrors'),
                            'detail': 'ok' if not metrics.get('runtimeErrors') else ' | '.join(metrics['runtimeErrors']),
                        },
                        {
                            'name': 'horizontal overflow',
                            'pass': metrics.get('horizontalOverflow') is False,
                            'detail': f'scrollWidth {metrics.get("scrollWidth")} / clientWidth {metrics.get("clientWidth")}',
                        },
                    ])
                except (RuntimeError, ValueError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as error:
                    metrics = {'ready': False, 'probeError': str(error)}
                    checks.append({'name': 'browser probe', 'pass': False, 'detail': str(error)})

                screenshot_error = None
                try:
                    run_chromium([
                        f'--window-size={browser_width},{viewport["height"]}',
                        '--hide-scrollbars',
                        '--run-all-compositor-stages-before-draw',
                        '--virtual-time-budget=5000',
                        f'--screenshot={screenshot_path}',
                        screenshot_url,
                    ], capture_stdout=False)
                    screenshot_width, screenshot_height = png_dimensions(screenshot_path)
                    checks.append({
                        'name': 'screenshot viewport',
                        'pass': screenshot_width == viewport['width'] and screenshot_height == viewport['height'],
                        'detail': f'expected {viewport["width"]}x{viewport["height"]}, got {screenshot_width}x{screenshot_height}',
                    })
                except (OSError, ValueError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as error:
                    screenshot_error = str(error)
                    checks.append({'name': 'screenshot', 'pass': False, 'detail': screenshot_error})

                viewport_ok = all(check['pass'] for check in checks)
                route_result['ok'] = route_result['ok'] and viewport_ok
                route_result['viewports'].append({
                    'id': viewport['id'],
                    'requestedWidth': viewport['width'],
                    'requestedHeight': viewport['height'],
                    'metrics': metrics,
                    'checks': checks,
                    'screenshot': str(screenshot_path.relative_to(PROJECT_ROOT)) if screenshot_error is None else None,
                    'ok': viewport_ok,
                })
            report['routes'].append(route_result)
            report['summary']['passed' if route_result['ok'] else 'failed'] += 1
    finally:
        httpd.shutdown()
        httpd.server_close()
        PROBE_PATH.unlink(missing_ok=True)

REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
if report['summary']['failed']:
    raise SystemExit(1)
