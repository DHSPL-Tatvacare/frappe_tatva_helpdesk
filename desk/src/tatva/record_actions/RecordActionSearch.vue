<!-- One server-searched field of a record action's dialog, shaped like Helpdesk's Link: a button Combobox whose list the server matches as the person types; it reads only once opened. -->
<template>
  <Combobox
    class="group"
    trigger="button"
    :model-value="modelValue || null"
    :options="options"
    :loading="results.loading"
    :filterable="false"
    :label="field.label"
    :required="!!field.reqd"
    :placeholder="field.placeholder || __('Search')"
    variant="outline"
    v-model:query="text"
    @update:open="onOpen"
    @update:model-value="pick"
  >
    <template v-if="modelValue" #suffix>
      <span
        role="button"
        tabindex="0"
        :aria-label="__('Clear')"
        class="hidden size-4 shrink-0 place-items-center rounded-1 text-ink-gray-5 group-hover:grid group-focus-within:grid hover:bg-surface-gray-3 hover:text-ink-gray-7"
        @click.stop="pick(null)"
        @keydown.enter.stop.prevent="pick(null)"
        @pointerdown.stop
      >
        <span class="lucide-x size-3.5" />
      </span>
    </template>
  </Combobox>
</template>

<script setup lang="ts">
import { __ } from "@/translation";
import { watchDebounced } from "@vueuse/core";
import { Combobox, createResource } from "frappe-ui";
import { computed, ref } from "vue";
import {
  RECORD_ACTIONS_API,
  toOption,
  type RecordActionField,
  type RecordActionOption,
} from "./recordActions";

const props = defineProps<{
  field: RecordActionField;
  doctype: string;
  name: string;
  action: string;
  // The dialog's choices the search depends on, such as the project.
  values: Record<string, unknown>;
}>();
const modelValue = defineModel<string | null>();

const text = ref("");
const isOpen = ref(false);
// The picked option, kept so the trigger still shows it when a later search does not return it.
const picked = ref<RecordActionOption | null>(null);

const results = createResource({
  url: `${RECORD_ACTIONS_API}.search`,
  method: "GET",
  makeParams: ({ query }: { query: string }) => ({
    action: props.action,
    doctype: props.doctype,
    name: props.name,
    field: props.field.fieldname,
    query,
    values: JSON.stringify(props.values),
  }),
});

// One search per query: the list on screen already answers the query it was read for.
function search(query: string) {
  if (results.fetched && results.params?.query === query) return;
  results.fetch({ query });
}

const options = computed(() => {
  const rows: RecordActionOption[] = results.data || [];
  const withPicked =
    picked.value && !rows.some((r) => r.value === picked.value!.value) ? [picked.value, ...rows] : rows;
  return withPicked.map(toOption);
});

function onOpen(open: boolean) {
  isOpen.value = open;
  if (!open) return;
  text.value = "";
  search("");
}

// Typing searches again once the person pauses; the server keeps each answer for a while.
watchDebounced(text, (query) => isOpen.value && search(query), { debounce: 300 });

function pick(value: string | null) {
  picked.value = (results.data || []).find((r: RecordActionOption) => r.value === value) || null;
  modelValue.value = value;
}
</script>
