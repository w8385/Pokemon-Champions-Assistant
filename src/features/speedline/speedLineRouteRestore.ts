import type { SpeedLineState } from './speedLineState.ts'

type SpeedLineRoute = { state: SpeedLineState; warnings: string[] }

export function mergeSpeedLineRoute(previous: SpeedLineRoute | null, incoming: SpeedLineRoute): SpeedLineRoute {
  return {
    state: incoming.state,
    warnings: incoming.warnings.length || !previous || JSON.stringify(previous.state) !== JSON.stringify(incoming.state)
      ? incoming.warnings
      : previous.warnings,
  }
}

export function speedLineRouteAfterEdit(state: SpeedLineState): SpeedLineRoute {
  return { state, warnings: [] }
}
