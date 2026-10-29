// Record actions on tatva_connect's one door (tatva_connect.api.record_actions): what a record offers, an action's form, its searches, running it and what earlier runs made; the CRM has the same pieces.
import { Avatar } from "frappe-ui";
import { h, ref, type Component } from "vue";

export const RECORD_ACTIONS_API = "tatva_connect.api.record_actions";

// Bumped by every run that made something, so a record's links re-read without a reload.
export const recordActionsRan = ref(0);

export interface RecordAction {
  key: string;
  label: string;
  icon: string;
}

// An option as the server sends it; `image` is the option's own picture, `round` draws it as a person.
export interface RecordActionOption {
  label: string;
  value: string;
  image?: string | null;
  round?: 0 | 1;
}

export interface RecordActionField {
  fieldname: string;
  label: string;
  fieldtype: "Data" | "Small Text" | "Select" | "Date" | "Search" | "Tags";
  reqd?: 0 | 1;
  default?: string | string[] | null;
  options?: RecordActionOption[];
  placeholder?: string;
  // Shares its row with the next half field from sm up.
  half?: 0 | 1;
  // A change asks the server for the form again.
  reloads?: 0 | 1;
  // Tags only: a person may add a value the list does not have.
  allow_new?: 0 | 1;
}

export interface RecordActionLinkView {
  key: string;
  url: string;
  section: string;
  icon?: string | null;
  title?: string;
  status?: string;
  stage?: string;
  owner?: string;
  priority?: string;
  updated?: string;
  error?: string;
}

export interface RecordActionForm {
  title: string;
  submit: string;
  icon: string;
  fields: RecordActionField[];
  warning?: string | null;
  existing: RecordActionLinkView[];
}

// A server option as a frappe-ui option, its picture as the row's icon.
export function toOption(option: RecordActionOption) {
  return { label: option.label, value: option.value, icon: option.image ? pictureOf(option) : undefined };
}

function pictureOf(option: RecordActionOption): Component {
  return () =>
    option.round
      ? h(Avatar, { image: option.image, label: option.label, size: "xs", shape: "circle" })
      : h("img", {
          src: option.image,
          alt: "",
          class: "size-4 shrink-0 rounded-sm",
          // A picture the page may not load hides itself, as Avatar falls back to initials.
          onError: (e: Event) => ((e.target as HTMLImageElement).hidden = true),
        });
}

// Jira's status category as a badge colour.
export const STAGE_THEME: Record<string, string> = {
  new: "gray",
  indeterminate: "blue",
  done: "green",
};
