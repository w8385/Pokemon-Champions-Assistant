"""Mounted Dex route restoration regression. Run in browser_exec session: exec(open(path).read())."""
import time

base = 'http://localhost:5216/'
route_a = '#/dex?dexTab=pokemon&q=pika&uq=pika&sel=pokemon%3Apikachu'
route_b = '#/dex?dexTab=move&q=10%EB%A7%8C&uq=10%EB%A7%8C&sel=move%3A10%EB%A7%8C%EB%B3%BC%ED%8A%B8'
new_tab(base + route_a)
wait_for_load()
time.sleep(.3)
js('history.pushState(null,"",' + repr(route_a) + '); dispatchEvent(new PopStateEvent("popstate"))')
time.sleep(.3)
js('history.pushState(null,"",' + repr(route_b) + '); dispatchEvent(new PopStateEvent("popstate"))')
time.sleep(.35)
js('history.back()')
time.sleep(.55)
a = js('({hash:location.hash,input:document.querySelector(".dex-search-autocomplete input")?.value, detail:document.querySelector(".dex-detail-card")?.innerText || "", results:[...document.querySelectorAll(".dex-results-list .dex-result-item")].map(e=>e.innerText)})')
assert 'dexTab=pokemon' in a['hash'] and 'q=pika' in a['hash'] and 'uq=pika' in a['hash'], a
assert a['input'] == 'pika' and 'Pikachu' in a['detail'] and any('Pikachu' in x for x in a['results']), a
js('history.forward()')
time.sleep(.55)
b = js('({hash:location.hash,input:document.querySelector(".dex-search-autocomplete input")?.value,detail:document.querySelector(".dex-detail-card")?.innerText || "",results:[...document.querySelectorAll(".dex-results-list .dex-result-item")].map(e=>e.innerText)})')
assert 'dexTab=move' in b['hash'] and 'q=10%EB%A7%8C' in b['hash'] and b['input'] == '10만' and '10만볼트' in b['detail'] and any('10만볼트' in x for x in b['results']), b
cdp('Page.reload', ignoreCache=True)
wait_for_load()
time.sleep(.35)
reload_state = js('({hash:location.hash,input:document.querySelector(".dex-search-autocomplete input")?.value,detail:document.querySelector(".dex-detail-card")?.innerText || ""})')
assert reload_state['input'] == '10만' and 'dexTab=move' in reload_state['hash'] and '10만볼트' in reload_state['detail'], reload_state
print({'back': a, 'forward': b, 'reload': reload_state})
