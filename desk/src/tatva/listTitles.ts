// A list cell's text: a Link value's title from the list's own `_link_titles` (tatva_connect.helpdesk.lists), else the value itself; names no field.
export function cellText(data: any, column: { type?: string; options?: string }, value: unknown) {
  if (column.type !== "Link" || !value) return value;
  return data?._link_titles?.[`${column.options}::${value}`] ?? value;
}
