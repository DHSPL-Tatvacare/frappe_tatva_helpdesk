<!-- The new-ticket page's Grain field. The server decides the grains on offer and the ticket's own grain columns. One grain is applied and locked, several are one required pick. v-model is {} until a grain is settled, the ticket's grain fields once it is, and null when there is nothing to pick, so the server's own check decides. -->
<template>
  <div v-if="choices.data" class="flex flex-col gap-2">
    <span class="block text-sm text-ink-gray-6">
      {{ __("Grain") }}
      <span class="place-self-center text-ink-red-5"> * </span>
    </span>
    <div v-if="options.length" class="flex">
      <div
        v-if="locked"
        class="flex min-w-0 flex-1 items-center gap-1.5 rounded bg-surface-gray-2 px-2.5 py-1.5 text-base text-ink-gray-7"
      >
        <lucide-lock class="h-3.5 w-3.5 shrink-0 text-ink-gray-5" />
        <span class="truncate">{{ options[0].label }}</span>
      </div>
      <FormControl
        v-else
        v-model="region"
        class="min-w-0 flex-1"
        type="select"
        variant="outline"
        :options="options"
        :placeholder="__('Select a grain')"
      />
    </div>
    <span v-else class="text-p-sm text-ink-gray-5">
      {{ __("No grain is open to you. Ask your manager to grant one.") }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { __ } from "@/translation";
import { createResource } from "frappe-ui";
import { computed, ref, watch } from "vue";

type Grain = { vertical: string; group: string; program: string };

const AXES: (keyof Grain)[] = ["vertical", "group", "program"];
const SEP = "::";

const emit = defineEmits(["update:modelValue"]);

const choices = createResource({
  url: "tatva_connect.helpdesk.ticket.grain_choices",
  method: "GET",
  auto: true,
});

const keyOf = (g: Grain) => AXES.map((a) => g[a] || "").join(SEP);
const axesOf = (key: string): Grain => {
  const [vertical = "", group = "", program = ""] = key.split(SEP);
  return { vertical, group, program };
};
const labelOf = (g: Grain) => AXES.map((a) => g[a]).filter(Boolean).join(" · ");

const options = computed(() =>
  (choices.data?.grains || []).map((g: Grain) => ({ label: labelOf(g), value: keyOf(g) }))
);
const locked = computed(() => options.value.length === 1);

const region = ref("");
// One grain is applied without a question.
watch(options, (o) => locked.value && !region.value && (region.value = o[0].value), { immediate: true });

const value = computed(() => {
  if (choices.error || (choices.data && !options.value.length)) return null;
  if (!region.value) return {};
  const grain = axesOf(region.value);
  return Object.fromEntries(
    (choices.data.fields as (string | null)[])
      .map((field, i) => [field, grain[AXES[i]] || ""])
      .filter(([field]) => field)
  );
});
watch(value, (v) => emit("update:modelValue", v), { immediate: true });
</script>
