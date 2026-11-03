export function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[^0-9a-z가-힣ぁ-んァ-ヶ一-龯]+/g, '')
}
