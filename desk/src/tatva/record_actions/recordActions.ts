// Record actions on tatva_connect's one door (tatva_connect.api.record_actions): what a record offers, an action's form, running it and what earlier runs made; the CRM has the same pieces.
import { ref } from "vue";

export const RECORD_ACTIONS_API = "tatva_connect.api.record_actions";

// Bumped by every run that made something, so a record's links re-read without a reload.
export const recordActionsRan = ref(0);

export interface RecordAction {
  key: string;
  label: string;
  icon: string;
}

export interface RecordActionField {
  fieldname: string;
  label: string;
  fieldtype: "Data" | "Small Text" | "Select";
  reqd?: 0 | 1;
  options?: string[];
  default?: string | null;
  // Options that follow another field's value: { field: { value: options } }.
  options_by?: Record<string, Record<string, string[]>>;
}

// A field's control in frappe-ui's FormControl.
export function controlOf(field: RecordActionField) {
  return field.fieldtype === "Select"
    ? "select"
    : field.fieldtype === "Small Text"
      ? "textarea"
      : "text";
}

// A field's options now: its own, or those that follow the field it names in options_by.
export function optionsOf(
  field: RecordActionField,
  values: Record<string, unknown>
) {
  const [on, byValue] = Object.entries(field.options_by || {})[0] || [];
  const options = on ? byValue[String(values[on] ?? "")] || [] : field.options || [];
  return options.map((value) => ({ label: value, value }));
}

// Jira's status category as a badge colour.
export const STAGE_THEME: Record<string, string> = {
  new: "gray",
  indeterminate: "blue",
  done: "green",
};
