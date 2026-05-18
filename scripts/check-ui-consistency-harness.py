#!/usr/bin/env python3
import http.server
import json
import os
import re
import shutil
import socketserver
import subprocess
import threading
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = PROJECT_ROOT / 'dist'
REPORTS_DIR = PROJECT_ROOT / 'reports'
ARTIFACT_DIR = REPORTS_DIR / 'ui-consistency'
REPORT_PATH = REPORTS_DIR / 'uiConsistencyHarness.json'
PORT = 0

ROUTES = [
    {'id': 'home', 'hash': '#/', 'expectedPrimary': '홈'},
    {'id': 'single-party', 'hash': '#/single?tab=party', 'expectedPrimary': '싱글배틀 메뉴', 'expectedSecondary': '내 파티 관리'},
    {'id': 'single-pick', 'hash': '#/single?tab=pick', 'expectedPrimary': '싱글배틀 메뉴', 'expectedSecondary': '상대 엔트리'},
    {'id': 'single-speed', 'hash': '#/single?tab=speed', 'expectedPrimary': '싱글배틀 메뉴', 'expectedSecondary': '스피드 계산'},
    {'id': 'single-power', 'hash': '#/single?tab=power', 'expectedPrimary': '싱글배틀 메뉴', 'expectedSecondary': '대미지 계산'},
    {'id': 'double-board', 'hash': '#/double', 'expectedPrimary': '더블배틀 메뉴', 'expectedSubtitle': '더블배틀 메뉴', 'expectedText': '더블 계산 작업 보드'},
    {'id': 'sample-builder', 'hash': '#/sample-builder?sampleTab=builder', 'expectedPrimary': '포켓몬 샘플 깎기', 'expectedSecondary': '샘플 빌드'},
    {'id': 'sample-speed', 'hash': '#/sample-builder?sampleTab=speed', 'expectedPrimary': '포켓몬 샘플 깎기', 'expectedSecondary': '샘플 스피드'},
    {'id': 'sample-damage', 'hash': '#/sample-builder?sampleTab=damage', 'expectedPrimary': '포켓몬 샘플 깎기', 'expectedSecondary': '샘플 대미지 계산'},
]

VIEWPORTS = [
    {'id': 'desktop', 'width': 1440, 'height': 2200},
    {'id': 'mobile', 'width': 390, 'height': 2200},
]

if not DIST_DIR.exists():
    raise SystemExit('dist 폴더가 없습니다. 먼저 npm run build 를 실행하세요.')

shutil.rmtree(ARTIFACT_DIR, ignore_errors=True)
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

os.chdir(DIST_DIR)
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        return

Handler = QuietHandler
httpd = socketserver.TCPServer(('127.0.0.1', PORT), Handler)
ACTUAL_PORT = httpd.server_address[1]
thread = threading.Thread(target=httpd.serve_forever, daemon=True)
thread.start()
time.sleep(1)


def run_chromium(args, capture_stdout=True):
    command = ['chromium-browser', '--headless', '--disable-gpu', '--no-sandbox', *args]
    return subprocess.run(
        command,
        cwd=PROJECT_ROOT,
        text=True,
        stdout=subprocess.PIPE if capture_stdout else subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        timeout=60,
        check=True,
    )


def extract_first(text, pattern):
    match = re.search(pattern, text, re.S)
    return re.sub(r'<[^>]+>', '', match.group(1)).strip() if match else None


def extract_active_texts(text, class_name):
    pattern = re.compile(rf'<button[^>]*class="[^"]*{re.escape(class_name)} active[^"]*"[^>]*>(.*?)</button>', re.S)
    return [re.sub(r'<[^>]+>', '', match).strip() for match in pattern.findall(text)]


report = {
    'generatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    'source': 'Chromium headless DOM/screenshot harness',
    'routes': [],
    'summary': {'passed': 0, 'failed': 0, 'warnings': 0},
}

try:
    for route in ROUTES:
        url = f'http://127.0.0.1:{ACTUAL_PORT}/{route["hash"]}'
        html = run_chromium(['--virtual-time-budget=3000', '--dump-dom', url]).stdout
        active_primary = extract_active_texts(html, 'header-primary-tab')
        active_flow = extract_active_texts(html, 'flow-node')
        active_sample = extract_active_texts(html, 'sample-filter-chip')
        active_secondary = active_flow[0] if active_flow else (active_sample[0] if active_sample else None)
        route_result = {
            'id': route['id'],
            'url': url,
            'title': extract_first(html, r'<h1>(.*?)</h1>'),
            'subtitle': extract_first(html, r'<h1>.*?</h1><p>(.*?)</p>'),
            'activePrimary': active_primary,
            'activeSecondary': active_secondary,
            'panelCount': len(re.findall(r'class="[^"]*panel', html)),
            'sectionHeadCount': len(re.findall(r'class="[^"]*section-head', html)),
            'utilityButtonCount': len(re.findall(r'class="icon-button"', html)),
            'screenshots': [],
            'checks': [],
            'ok': True,
        }
        checks = [
            ('primary tab', len(active_primary) == 1 and active_primary[0] == route['expectedPrimary'], f"expected {route['expectedPrimary']}, got {', '.join(active_primary) or 'none'}"),
            ('utility buttons', route_result['utilityButtonCount'] == 2, f"expected 2, got {route_result['utilityButtonCount']}"),
            ('page title', route_result['title'] == '포켓몬 챔피언스 배틀 도우미', f"unexpected title: {route_result['title']}"),
            ('panel presence', route_result['panelCount'] >= 1, f"expected at least 1 panel, got {route_result['panelCount']}"),
        ]
        if 'expectedSecondary' in route:
            checks.append(('secondary tab', route_result['activeSecondary'] == route['expectedSecondary'], f"expected {route['expectedSecondary']}, got {route_result['activeSecondary'] or 'none'}"))
        if 'expectedSubtitle' in route:
            checks.append(('subtitle', route_result['subtitle'] == route['expectedSubtitle'], f"expected {route['expectedSubtitle']}, got {route_result['subtitle'] or 'none'}"))
        if 'expectedText' in route:
            checks.append(('route content', route['expectedText'] in html, f"missing text: {route['expectedText']}"))
        for name, passed, detail in checks:
            route_result['checks'].append({'name': name, 'pass': passed, 'detail': 'ok' if passed else detail})
            if not passed:
                route_result['ok'] = False
        for viewport in VIEWPORTS:
            rel_path = Path('reports/ui-consistency') / f"{route['id']}-{viewport['id']}.png"
            run_chromium([
                f"--window-size={viewport['width']},{viewport['height']}",
                '--hide-scrollbars',
                '--run-all-compositor-stages-before-draw',
                '--virtual-time-budget=3000',
                f'--screenshot={rel_path.as_posix()}',
                url,
            ], capture_stdout=False)
            route_result['screenshots'].append({'viewport': viewport['id'], 'path': rel_path.as_posix()})
        report['routes'].append(route_result)
        if route_result['ok']:
            report['summary']['passed'] += 1
        else:
            report['summary']['failed'] += 1
finally:
    httpd.shutdown()
    httpd.server_close()

REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False, indent=2))
