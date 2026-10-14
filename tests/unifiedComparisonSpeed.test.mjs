import test from 'node:test'
import assert from 'node:assert/strict'
import { effectiveComparisonSpeed } from '../src/unifiedComparisonSpeed.ts'
const row={key:'normal',speed:100,abilities:[]}
test('actual effort and nature (not hypothetical 32 fast) drive comparison',()=>{
 const a=effectiveComparisonSpeed(row,0,1,0,false)
 const b=effectiveComparisonSpeed(row,32,1.1,0,false)
 assert.equal(a.value,120); assert.equal(b.value,167)
})
test('scarf and rank apply after actual speed; Mega scarf rejected',()=>{
 const a=effectiveComparisonSpeed(row,0,1,1,true)
 assert.ok(a.value>120)
 assert.equal(effectiveComparisonSpeed({...row,key:'mega-lucario-z'},0,1,0,true).value,null)
})
