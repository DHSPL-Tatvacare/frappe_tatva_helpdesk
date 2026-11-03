// An open ticket's pickers as the server scopes them: grain filters per field and the title of each value held; names no field or doctype.
import { useTicket } from "@/composables/useTicket";
import { call, createResource } from "frappe-ui";
import { watch, type Ref } from "vue";

export interface TicketPickers {
  filters: Record<string, Record<string, unknown>>;
  titles: Record<string, string>;
}

// Per ticket and field, the filters last handed out: a reload with the same content returns the same object, so no picker refetches.
const held: Record<string, { key: string; filters: Record<string, unknown> }> = {};

function stable(ticket: string, fieldname: string, filters: Record<string, unknown>) {
  const key = JSON.stringify(filters);
  const slot = `${ticket}::${fieldname}`;
  if (held[slot]?.key !== key) held[slot] = { key, filters };
  return held[slot].filters;
}

// A panel field with the server's grain filters and its value's title.
export function scopeField<F extends { fieldname: string; options?: string; value?: unknown }>(ticket: string, field: F) {
  const data = ticket ? useTicket(ticket).pickers.data : null;
  if (!data) return field;
  const scoped = data.filters?.[field.fieldname];
  const filters = scoped && stable(ticket, field.fieldname, scoped);
  const title = field.value ? data.titles?.[`${field.options}::${field.value}`] : undefined;
  return filters || title ? { ...field, ...(filters && { filters }), ...(title && { title }) } : field;
}

// The new-ticket page once the agent picks a grain: each picker takes the server's filters for it, and a changed grain clears the values it scoped.
export function useNewTicketPickers(grain: Ref<Record<string, string> | null>, values: Record<string, unknown>) {
  const answer = createResource({ url: "tatva_connect.helpdesk.pickers.new_ticket_pickers" });
  watch(
    grain,
    (picked, before) => {
      if (!picked || !Object.keys(picked).length || JSON.stringify(picked) === JSON.stringify(before)) return;
      const changed = before && Object.keys(before).length;
      answer.submit({ fields: picked }, {
        onSuccess: (filters: Record<string, unknown>) => changed && Object.keys(filters).forEach((f) => (values[f] = "")),
      });
    },
    { immediate: true }
  );
  return <F extends { fieldname: string; filters?: Record<string, unknown> }>(field: F) => {
    const scoped = answer.data?.[field.fieldname];
    return scoped ? { ...field, filters: stable("new", field.fieldname, { ...field.filters, ...scoped }) } : field;
  };
}

// A picker's options for an open ticket outside its panel (the command palette): the same filters the panel uses, each with its label.
export async function scopedOptions(ticket: string, fieldname: string, doctype: string): Promise<{ value: string; label: string }[]> {
  const { pickers } = useTicket(ticket);
  if (!pickers.data) await pickers.reload();
  const filters = pickers.data?.filters?.[fieldname];
  const rows = await call("frappe.desk.search.search_link", { doctype, txt: "", filters, page_length: 100 });
  return (rows || []).map((r: { value: string; label?: string }) => ({ value: r.value, label: r.label || r.value }));
}
