<!-- One record action's dialog: the server's fields for the choices made so far, what earlier runs already made, a refresh of what the server remembers, and the submit; a bottom sheet on a phone. -->
<template>
  <DefineHeader>
    <div class="flex min-w-0 items-center gap-2">
      <img :src="action.icon" alt="" class="size-5 shrink-0" />
      <h3 class="truncate text-2xl-semibold leading-6 text-ink-gray-8">
        {{ form.data?.title || action.label }}
      </h3>
      <Tooltip :text="__('Refresh')">
        <Button
          variant="ghost"
          icon="lucide-refresh-cw"
          class="ms-auto shrink-0"
          :aria-label="__('Refresh')"
          :loading="refreshing"
          :disabled="form.loading"
          @click="refresh"
        />
      </Tooltip>
    </div>
  </DefineHeader>

  <DefineBody>
    <div v-if="!form.data" class="flex flex-col gap-4">
      <Skeleton v-for="n in 5" :key="n" class="h-7 w-full rounded" />
    </div>
    <div v-else class="flex flex-col gap-4">
      <Alert
        v-if="form.data.existing.length"
        theme="blue"
        :title="__('Already created from here')"
      >
        <template #description>
          <span class="flex flex-wrap gap-x-3 gap-y-1">
            <a
              v-for="link in form.data.existing"
              :key="link.key"
              :href="link.url"
              target="_blank"
              rel="noopener"
              class="font-medium text-ink-gray-8 underline-offset-2 hover:underline"
            >
              {{ link.key
              }}<template v-if="link.status"> · {{ link.status }}</template>
            </a>
          </span>
        </template>
      </Alert>
      <Alert
        v-if="form.data.warning"
        theme="amber"
        :title="form.data.warning"
      />
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="field in form.data.fields"
          :key="field.fieldname"
          :class="field.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'"
        >
          <RecordActionSearch
            v-if="field.fieldtype === 'Search'"
            :key="searchKey"
            v-model="values[field.fieldname] as string | null"
            :field="field"
            :action="action.key"
            :doctype="doctype"
            :name="name"
            :values="builtFor"
          />
          <RecordActionTags
            v-else-if="field.fieldtype === 'Tags'"
            v-model="values[field.fieldname] as string[]"
            :field="field"
          />
          <FormControl
            v-else
            v-model="values[field.fieldname]"
            :type="CONTROL[field.fieldtype]"
            :label="field.label"
            :required="!!field.reqd"
            :placeholder="field.placeholder"
            :options="field.options?.map(toOption)"
            variant="outline"
          >
            <template #item-suffix="{ item }">
              <span
                v-if="item.hint"
                class="shrink-0 text-p-sm text-ink-gray-5"
                >{{ item.hint }}</span
              >
            </template>
          </FormControl>
        </div>
      </div>
    </div>
  </DefineBody>

  <DefineSubmit>
    <div class="flex justify-end">
      <Button
        variant="solid"
        class="w-full sm:w-auto"
        :label="form.data?.submit || action.label"
        :loading="saving"
        :disabled="!ready"
        @click="submit"
      />
    </div>
  </DefineSubmit>

  <!-- The sheet scrolls its own body; the header and submit stay pinned inside that one scroll. -->
  <BottomSheet v-if="isMobileView" v-model:open="open">
    <div class="sticky top-0 z-10 bg-surface-base px-4 pb-3">
      <ReuseHeader />
    </div>
    <div class="px-4"><ReuseBody /></div>
    <div class="sticky bottom-0 z-10 bg-surface-base px-4 py-4">
      <ReuseSubmit />
    </div>
  </BottomSheet>
  <Dialog v-else v-model:open="open" size="3xl">
    <template #title><ReuseHeader /></template>
    <template #default><ReuseBody /></template>
    <template #actions><ReuseSubmit /></template>
  </Dialog>
</template>

<script setup lang="ts">
import { __ } from "@/translation";
import { useScreenSize } from "@/composables/screen";
import { createReusableTemplate } from "@vueuse/core";
import {
  Alert,
  BottomSheet,
  Button,
  call,
  createResource,
  Dialog,
  FormControl,
  Skeleton,
  toast,
  Tooltip,
} from "frappe-ui";
import { computed, reactive, ref, watch } from "vue";
import RecordActionSearch from "./RecordActionSearch.vue";
import RecordActionTags from "./RecordActionTags.vue";
import {
  RECORD_ACTIONS_API,
  recordActionsRan,
  toOption,
  type RecordAction,
  type RecordActionField,
  type RecordActionForm,
} from "./recordActions";

const props = defineProps<{
  action: RecordAction;
  doctype: string;
  name: string;
}>();
const open = defineModel<boolean>("open", { default: false });

// The header, fields and submit are written once and shown in a Dialog, or a BottomSheet on a phone.
const [DefineHeader, ReuseHeader] = createReusableTemplate();
const [DefineBody, ReuseBody] = createReusableTemplate();
const [DefineSubmit, ReuseSubmit] = createReusableTemplate();
const { isMobileView } = useScreenSize();

// FormControl's type for each server fieldtype it draws.
const CONTROL: Record<string, string> = {
  Data: "text",
  "Small Text": "textarea",
  Select: "select",
  Date: "date",
};

const values = reactive<Record<string, unknown>>({});
const saving = ref(false);
const refreshing = ref(false);

const errorOf = (e: any) =>
  e?.messages?.[0] || e?.message || __("Something went wrong");

const form = createResource({
  url: `${RECORD_ACTIONS_API}.form`,
  method: "GET",
  makeParams: () => ({
    action: props.action.key,
    doctype: props.doctype,
    name: props.name,
    values: JSON.stringify(choices.value),
  }),
  onError: (e: unknown) => {
    toast.error(errorOf(e));
    open.value = false;
  },
});

const fields = computed<RecordActionField[]>(
  () => (form.data as RecordActionForm | undefined)?.fields || []
);
const reloading = computed(() => fields.value.filter((f) => f.reloads));
// The choices that shape the form, such as project and issue type: as the person has them, and as the server built the form for.
const choicesOf = (read: (f: RecordActionField) => unknown) =>
  Object.fromEntries(
    reloading.value.map((f) => [f.fieldname, read(f) ?? null])
  );
const choices = computed(() => choicesOf((f) => values[f.fieldname]));
const builtFor = computed(() => choicesOf((f) => f.default));
// A search follows the choices the form was built for, so a rebuilt form starts its searches afresh.
const searchKey = computed(() => JSON.stringify(builtFor.value));

// Each field takes the server's default unless the person already set a value it still offers; gone fields are dropped.
function applyDefaults(data: RecordActionForm) {
  const names = new Set(data.fields.map((f) => f.fieldname));
  for (const key of Object.keys(values))
    if (!names.has(key)) delete values[key];
  for (const field of data.fields) {
    const offered =
      field.fieldtype !== "Select" ||
      field.options?.some((o) => o.value === values[field.fieldname]);
    if (values[field.fieldname] === undefined || !offered)
      values[field.fieldname] = Array.isArray(field.default)
        ? [...field.default]
        : field.default ?? (field.fieldtype === "Tags" ? [] : null);
  }
}
// Choices the form was not built for ask for it again; a searched value belonged to the old choices.
// Checked on every change and again when a load lands, so a choice made while loading is not lost.
function rebuildIfChoicesChanged() {
  if (
    !form.data ||
    form.loading ||
    JSON.stringify(choices.value) === searchKey.value
  )
    return;
  for (const f of fields.value)
    if (f.fieldtype === "Search") values[f.fieldname] = null;
  form.reload();
}
watch(
  () => form.data,
  (data) => {
    if (!data) return;
    applyDefaults(data);
    rebuildIfChoicesChanged();
  },
  { immediate: true }
);
watch(() => JSON.stringify(choices.value), rebuildIfChoicesChanged);

// Opening reads the form while the last one paints at once; closing puts every field back to its default.
function resetValues() {
  for (const key of Object.keys(values)) delete values[key];
  if (form.data) applyDefaults(form.data);
}
watch(
  open,
  (isOpen) =>
    isOpen ? (form.fetched ? form.reload() : form.fetch()) : resetValues(),
  { immediate: true }
);
// Another record's dialog starts from nothing.
watch(
  () => props.name,
  () => form.reset()
);

const ready = computed(
  () =>
    !form.loading &&
    fields.value.every(
      (f) =>
        !f.reqd ||
        (Array.isArray(values[f.fieldname])
          ? (values[f.fieldname] as unknown[]).length
          : String(values[f.fieldname] ?? "").trim())
    )
);

// Forget what the server remembers from the other system, then read the form afresh, one after the other.
function refresh() {
  refreshing.value = true;
  call(`${RECORD_ACTIONS_API}.refresh`, {
    action: props.action.key,
    doctype: props.doctype,
    name: props.name,
  })
    .then(() => form.reload())
    .catch((e: unknown) => toast.error(errorOf(e)))
    .finally(() => (refreshing.value = false));
}

function submit() {
  saving.value = true;
  call(`${RECORD_ACTIONS_API}.run`, {
    action: props.action.key,
    doctype: props.doctype,
    name: props.name,
    values: JSON.stringify(values),
  })
    .then((made: { key: string }) => {
      toast.success(__("Created {0}", [made.key]));
      recordActionsRan.value++;
      open.value = false;
    })
    .catch((e: unknown) => toast.error(errorOf(e)))
    .finally(() => (saving.value = false));
}
</script>
