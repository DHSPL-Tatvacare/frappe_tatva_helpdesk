// An open ticket follows its Field Dependency form scripts as the new-ticket page does; the scripts name the fields, this names none.
import { setupCustomizations } from "@/composables/formCustomisation";
import { reactive } from "vue";

type Allowed = Record<string, string[]>;

// Per ticket, the values each narrowed field may take; an empty list leaves it nothing to pick.
const allowedByTicket = reactive<Record<string, Allowed>>({});
// Per ticket, the parsed dependency scripts alone, apart from the ticket's other form scripts, which keep stock's behaviour.
const scriptsByTicket: Record<string, any> = {};
// One filters object per allowed list, so a picker reloads only when its list really changes.
const filtersFor = new WeakMap<string[], Record<string, unknown>>();

function allowedFor(ticket: string): Allowed {
  return (allowedByTicket[ticket] ||= {});
}

// The scripts' `applyFilters`: a list equal to the one held is kept, so a re-run changes nothing.
function applyFiltersFor(ticket: string) {
  return (fieldname: string, values: string[] | null) => {
    const next = values || [];
    const held = allowedFor(ticket)[fieldname];
    if (!held || held.join("\n") !== next.join("\n")) allowedFor(ticket)[fieldname] = next;
  };
}

function fire(scripts: any, fieldname: string, value: unknown) {
  scripts?._customOnChange?.[fieldname]?.forEach((fn: Function) => fn(value));
}

// The ticket's Field Dependency scripts, set up apart with their own `applyFilters`, then run on the values it holds; nothing is written.
export async function applyDependencies(ticket: string, data: any, ctx: object, doc: any) {
  if (!ticket) return;
  const scripts = { _form_script: data?._field_dependencies || [] };
  await setupCustomizations(scripts, { ...ctx, applyFilters: applyFiltersFor(ticket) });
  scriptsByTicket[ticket] = scripts;
  Object.keys(scripts._customOnChange || {}).forEach((fieldname) => fire(scripts, fieldname, doc?.[fieldname]));
}

// After a field is saved: run its scripts, and clear a field they re-narrowed whose value is no longer allowed.
export function followDependencies(ticket: string, fieldname: string, value: unknown, doc: any, save: (fieldname: string, value: string) => void) {
  const allowed = allowedFor(ticket);
  const before = { ...allowed };
  fire(scriptsByTicket[ticket], fieldname, value);
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
  let filters = filtersFor.get(values);
  if (!filters) filtersFor.set(values, (filters = { name: ["in", values] }));
  return { ...field, filters };
}
