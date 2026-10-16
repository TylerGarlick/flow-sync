export interface FlowTriggerPoint {
  timestamp: string;
  description?: string;
}

const TRIGGER_PATTERN =
  /^(\d{1,3}:[0-5]\d(?:\s*-\s*\d{1,3}:[0-5]\d)?)(?:\s+[-–—]\s+(.+))?$/;

export function parseFlowTriggerPoint(value: string): FlowTriggerPoint | undefined {
  const match = value.trim().match(TRIGGER_PATTERN);
  if (!match?.[1]) return undefined;

  return {
    timestamp: match[1],
    ...(match[2] ? { description: match[2].trim() } : {}),
  };
}
