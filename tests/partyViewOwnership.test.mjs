import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8')
test('Party and Double-party mount one extracted view; shared context bar remains in App', () => {
  const app = read('App.tsx'), view = read('features/party/PartyView.tsx')
  assert.match(app, /import \{ PartyView \} from '\.\/features\/party\/PartyView'/)
  assert.match(app, /mainSection === 'party' \|\| \(mainSection === 'double' && activeTab === 'party'\)/)
  assert.match(app, /<PartyView\b/)
  assert.match(view, /party-columns party-manage-columns/)
  assert.match(view, /<PartyPresetBoard\b/)
  assert.match(view, /<PartyMemberCard\b/)
  assert.match(app, /<PartyContextBar\b/)
  assert.doesNotMatch(view, /function PartyContextBar/)
})
test('editor lives at the unconditional App root and reuses the workspace authority', () => {
  const app = read('App.tsx'), editor = read('features/party/usePartyEditor.ts')
  assert.match(app, /usePartyEditor\(/)
  const appBody = app.slice(app.indexOf('export default function App()'))
  assert.ok(appBody.indexOf('usePartyEditor(') < appBody.indexOf('  return (\n    <div className="app-shell"'))
  assert.match(editor, /React\.useState<string\[\]>/)
  assert.match(editor, /selectPreset\(/)
  assert.match(editor, /setParty\(/)
  assert.doesNotMatch(editor, /useState\(.*workspace|workspaceReducer/)
  assert.doesNotMatch(app, /const \[partySearch, setPartySearch\]/)
})
