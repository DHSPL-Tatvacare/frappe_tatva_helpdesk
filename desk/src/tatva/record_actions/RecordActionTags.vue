<!-- A many-valued field of a record action's dialog: frappe-ui's MultiSelect over the server's options, plus the typed value as a new one when the field allows it. -->
<template>
  <MultiSelect
    v-model="model"
    v-model:query="text"
    :options="options"
    :label="field.label"
    :required="!!field.reqd"
    :placeholder="field.placeholder || __('Select')"
    variant="outline"
  >
    <template #summary="{ summary }">
      <span class="truncate">{{ model.length ? chosenLabels : summary }}</span>
    </template>
  </MultiSelect>
</template>

<script setup lang="ts">
import { __ } from "@/translation";
import { MultiSelect } from "frappe-ui";
import { computed, ref } from "vue";
import { toOption, type RecordActionField } from "./recordActions";

const props = defineProps<{ field: RecordActionField }>();
const model = defineModel<string[]>({ default: () => [] });

const text = ref("");

// The server's options, the values already chosen, and the typed value as a new one.
const options = computed(() => {
  const known = (props.field.options || []).map(toOption);
  const values = new Set(known.map((o) => o.value));
  const chosen = model.value
    .filter((v) => !values.has(v))
    .map((v) => ({ label: v, value: v }));
  const typed = text.value.trim();
  const fresh =
    props.field.allow_new &&
    typed &&
    !values.has(typed) &&
    !model.value.includes(typed)
      ? [{ label: __('Add "{0}"', [typed]), value: typed }]
      : [];
  return [...fresh, ...chosen, ...known];
});

const chosenLabels = computed(() => {
  const labelOf = new Map(
    (props.field.options || []).map((o) => [o.value, o.label])
  );
  return model.value.map((v) => labelOf.get(v) || v).join(", ");
});
</script>
