<!-- The record header's actions from tatva_connect: one action is a button, more make it a split button whose arrow lists the rest; nothing while the record offers none. -->
<template>
  <div v-if="offered.length" class="flex shrink-0 items-center">
    <Button
      v-if="compact"
      :aria-label="offered[0].label"
      :tooltip="offered[0].label"
      :class="offered.length > 1 && 'rounded-e-none'"
      @click="start(offered[0])"
    >
      <template #icon>
        <img :src="offered[0].icon" alt="" class="size-4 rounded-sm" />
      </template>
    </Button>
    <Button
      v-else
      :label="offered[0].label"
      :class="offered.length > 1 && 'rounded-e-none'"
      @click="start(offered[0])"
    >
      <template #prefix>
        <img :src="offered[0].icon" alt="" class="size-4 rounded-sm" />
      </template>
    </Button>
    <Dropdown v-if="offered.length > 1" :options="rest" align="end">
      <Button
        class="rounded-s-none border-s border-outline-gray-2"
        icon="lucide-chevron-down"
      />
    </Dropdown>
    <RecordActionDialog
      v-if="chosen"
      v-model:open="dialogOpen"
      :action="chosen"
      :doctype="doctype"
      :name="name"
    />
  </div>
</template>

<script setup lang="ts">
import { Button, createResource, Dropdown } from "frappe-ui";
import { computed, h, ref, watch } from "vue";
import RecordActionDialog from "./RecordActionDialog.vue";
import {
  FORM_VERSION,
  RECORD_ACTIONS_API,
  type RecordAction,
} from "./recordActions";

// `compact` shows the first action as its icon alone, for a phone header.
const props = defineProps<{
  doctype: string;
  name: string;
  compact?: boolean;
}>();

const actions = createResource({
  url: `${RECORD_ACTIONS_API}.actions`,
  method: "GET",
  makeParams: () => ({
    doctype: props.doctype,
    name: props.name,
    form_version: FORM_VERSION,
  }),
  onError() {}, // an older backend or a refusal leaves the header as it was
});
// One read per record; moving to another ticket reads that one's.
watch(
  () => props.name,
  (name) => name && actions.fetch(),
  { immediate: true }
);

const offered = computed<RecordAction[]>(() => actions.data || []);
const rest = computed(() =>
  offered.value.slice(1).map((action) => ({
    label: action.label,
    icon: () =>
      h("img", { src: action.icon, alt: "", class: "size-4 rounded-sm" }),
    onClick: () => start(action),
  }))
);

const chosen = ref<RecordAction | null>(null);
const dialogOpen = ref(false);
function start(action: RecordAction) {
  chosen.value = action;
  dialogOpen.value = true;
}
</script>
