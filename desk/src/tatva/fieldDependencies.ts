// An open ticket follows its Field Dependency form scripts as the new-ticket page does; the scripts name the fields, this names none.
import { reactive } from "vue";

type Allowed = Record<string, string[]>;

// Per ticket, the values each narrowed field may take; an empty list leaves it nothing to pick.
const allowedByTicket = reactive<Record<string, Allowed>>({});

function allowedFor(ticket: string): Allowed {
  return (allowedByTicket[ticket] ||= {});
}

// The scripts' `applyFilters`, given through the customization context of an open ticket.
export function dependencyContext(ticket: string) {
  return {
    applyFilters: (fieldname: string, values: string[] | null) => (allowedFor(ticket)[fieldname] = values || []),
  };
}

function fire(data: any, fieldname: string, value: unknown) {
  data?._customOnChange?.[fieldname]?.forEach((fn: Function) => fn(value));
}

// Every script, with the value its field holds now: a loaded ticket's fields start narrowed, nothing is written.
export function applyDependencies(data: any, doc: any) {
  Object.keys(data?._customOnChange || {}).forEach((fieldname) => fire(data, fieldname, doc?.[fieldname]));
}

// After a field is saved: run its scripts, and clear a field they re-narrowed whose value is no longer allowed.
export function followDependencies(ticket: string, data: any, fieldname: string, value: unknown, doc: any, save: (fieldname: string, value: string) => void) {
  const allowed = allowedFor(ticket);
  const before = { ...allowed };
  fire(data, fieldname, value);
  Object.keys(allowed)
    .filter((child) => allowed[child] !== before[child] && doc?.[child] && !allowed[child].includes(doc[child]))
    .forEach((child) => save(child, ""));
}

// A panel field as its dependency allows: a Link searches only the allowed names, a Select offers only them.
export function narrowField<F extends { fieldname: string; fieldtype?: string; options?: string; disabled?: boolean }>(ticket: string, field: F) {
  const values = allowedByTicket[ticket]?.[field.fieldname];
  if (!values) return field;
  if (!values.length) return { ...field, disabled: true };
  if (field.fieldtype === "Select") return { ...field, options: values.join("\n") };
  return { ...field, filters: { name: ["in", values] } };
}
