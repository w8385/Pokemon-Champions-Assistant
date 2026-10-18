import test from 'node:test'
import assert from 'node:assert/strict'
import { sourceBackedCardAbility } from '../src/creatorCardAbility.ts'

test('unknown Mega ability stays unknown despite its sole canonical option', () => {
  assert.equal(sourceBackedCardAbility({ megaKey:'mega-lucario-z', formKey:'mega-lucario-z', rowAbilities:['파동의방호'], ability:undefined }), undefined)
  assert.equal(sourceBackedCardAbility({ megaKey:'mega-gengar', formKey:'mega-gengar', rowAbilities:['그림자밟기'], ability:undefined }), undefined)
})
test('source-confirmed Mega ability maps only when matching canonical option or a source-backed pre-Mega ability', () => {
  assert.equal(sourceBackedCardAbility({ megaKey:'mega-floette', formKey:'mega-floette', rowAbilities:['페어리오라'], ability:'페어리오라' }), '페어리오라')
  assert.equal(sourceBackedCardAbility({ megaKey:'mega-scizor', formKey:'mega-scizor', rowAbilities:['테크니션'], ability:'테크니션', preMegaAbilities:['테크니션'] }), '테크니션')
  assert.equal(sourceBackedCardAbility({ megaKey:'mega-kangaskhan', formKey:'mega-kangaskhan', rowAbilities:['부자유친'], ability:'배짱', preMegaAbilities:['배짱'] }), '부자유친')
})
test('explicit source mismatch is not silently overwritten; toggled pre-Mega ability remains sourced', () => {
  assert.equal(sourceBackedCardAbility({ megaKey:'mega-golisopod', formKey:'mega-golisopod', rowAbilities:['굳건한신념'], ability:'かたいツメ' }), 'かたいツメ')
  assert.equal(sourceBackedCardAbility({ megaKey:'mega-kangaskhan', formKey:'kangaskhan', rowAbilities:['일찍기상','배짱'], ability:'부자유친', preMegaAbilities:['배짱'] }), '배짱')
  assert.equal(sourceBackedCardAbility({ megaKey:'mega-kangaskhan', formKey:'kangaskhan', rowAbilities:['일찍기상','배짱'], ability:'부자유친' }), undefined)
  assert.equal(sourceBackedCardAbility({ megaKey:null, formKey:'gyarados', rowAbilities:['위협'], ability:'いかく' }), 'いかく')
})
