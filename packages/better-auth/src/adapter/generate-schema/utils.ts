import path from 'node:path'

export function padding(str: string, indent = 2) {
  if (str.trim() === '') return ''
  return str
    .split('\n')
    .map((x) => (x.length > 0 ? `${' '.repeat(indent)}${x}` : x))
    .join('\n')
}

export function getPayloadPath(provided_payload_dir_path?: string) {
  const base_path = process.cwd()

  // If no path provided, use default "convex" in current directory
  if (!provided_payload_dir_path) {
    return path.join(base_path, 'payload')
  }

  // If it's already an absolute path and exists, use it directly
  if (path.isAbsolute(provided_payload_dir_path)) {
    return provided_payload_dir_path
  }

  // Otherwise, treat it as relative to current directory
  return path.join(base_path, provided_payload_dir_path)
}
