<!-- One record action's dialog: the fields the server sends, with their defaults, and its submit. -->
<template>
  <Dialog v-model:open="open" :title="form.data?.title || action.label">
    <template #default>
      <p v-if="form.loading" class="text-p-base text-ink-gray-5">
        {{ __("Loading…") }}
      </p>
      <div v-else-if="form.data" class="flex flex-col gap-4">
        <FormControl
          v-for="field in form.data.fields"
          :key="field.fieldname"
          v-model="values[field.fieldname]"
          :type="controlOf(field)"
          :label="field.label"
          :options="optionsOf(field, values)"
          :required="!!field.reqd"
          variant="outline"
        />
      </div>
    </template>
    <template #actions>
      <div class="flex justify-end">
        <Button
          variant="solid"
          :label="form.data?.submit || action.label"
          :loading="saving"
          :disabled="!ready"
          @click="submit"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { __ } from "@/translation";
import { Button, call, createResource, Dialog, FormControl, toast } from "frappe-ui";
import { computed, reactive, ref, watch } from "vue";
import {
  controlOf,
  optionsOf,
  RECORD_ACTIONS_API,
  recordActionsRan,
  type RecordAction,
  type RecordActionField,
} from "./recordActions";

const props = defineProps<{ action: RecordAction; doctype: string; name: string }>();
const open = defineModel<boolean>("open", { default: false });
const values = reactive<Record<string, string | null>>({});

const errorOf = (e: any) => e?.messages?.[0] || e?.message || __("Something went wrong");

const form = createResource({
  url: `${RECORD_ACTIONS_API}.form`,
  method: "GET",
  makeParams: () => ({ action: props.action.key, doctype: props.doctype, name: props.name }),
  onSuccess: (data: { fields: RecordActionField[] }) => {
    for (const field of data.fields) values[field.fieldname] = field.default ?? null;
  },
  onError: (e: unknown) => {
    toast.error(errorOf(e));
    open.value = false;
  },
});

const saving = ref(false);

// The form is read each time the dialog opens, so it always carries the record's current title.
watch(open, (isOpen) => isOpen && form.fetch(), { immediate: true });

// A field whose options follow another keeps a value only while it is still offered.
watch(
  () => form.data?.fields?.map((f: RecordActionField) => optionsOf(f, values)),
  () => {
    for (const field of (form.data?.fields || []) as RecordActionField[]) {
      const offered = optionsOf(field, values).map((o) => o.value);
      if (field.options_by && !offered.includes(values[field.fieldname] as string))
        values[field.fieldname] = offered[0] ?? null;
    }
  },
  { deep: true }
);

const ready = computed(() =>
  ((form.data?.fields || []) as RecordActionField[]).every(
    (f) => !f.reqd || String(values[f.fieldname] ?? "").trim()
  )
);

function submit() {
  saving.value = true;
  call(`${RECORD_ACTIONS_API}.run`, {
    action: props.action.key,
    doctype: props.doctype,
    name: props.name,
    values: JSON.stringify(values),
  })
    .then((made: { key: string }) => {
      toast.success(__("Raised {0}", [made.key]));
      recordActionsRan.value++;
      open.value = false;
    })
    .catch((e: unknown) => toast.error(errorOf(e)))
    .finally(() => (saving.value = false));
}
</script>
