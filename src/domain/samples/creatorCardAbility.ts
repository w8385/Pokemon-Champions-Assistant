// Card display must not turn a roster's sole Mega ability into source evidence.
export function sourceBackedCardAbility(input: {
  megaKey: string | null; formKey: string; rowAbilities?: readonly string[];
  ability?: string; preMegaAbilities?: readonly string[]; actualStatsForm?: string
}): string | undefined {
  const { megaKey, formKey, rowAbilities, ability, preMegaAbilities, actualStatsForm } = input
  if (megaKey && formKey === megaKey && rowAbilities?.length === 1 && ability &&
      (rowAbilities.includes(ability) || preMegaAbilities?.includes(ability))) return rowAbilities[0]
  if (!megaKey || formKey === megaKey) return ability
  if (preMegaAbilities?.length) return preMegaAbilities.join(' / ')
  return actualStatsForm === formKey ? ability : undefined
}
