// Native <details> keep their own open state across React route changes.
// Dismiss all route groups on selection, including selecting the current route.
export function closeHeaderMenu(link: Element): void {
  link.closest('#primary-navigation')?.querySelectorAll('details[open]').forEach(group => group.removeAttribute('open'))
}
