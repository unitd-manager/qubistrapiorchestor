export function filterPublished<T extends { Publish?: boolean }>(items: T[] | undefined): T[] {
  return (items ?? []).filter((item) => item.Publish !== false);
}

export function filterPublishedLive<T extends { attributes?: { published?: boolean } }>(
  items: T[] | undefined,
): T[] {
  return (items ?? []).filter((item) => item.attributes?.published !== false);
}