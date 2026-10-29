<!-- What record actions made for this record, one sidebar section each, read live from the other system; nothing while the record has none. -->
<template>
  <div v-for="group in groups" :key="group.section">
    <Section :label="group.section" v-model:opened="opened">
      <template #actions>
        <button
          class="ms-auto rounded p-1 text-ink-gray-5 hover:bg-surface-gray-2"
          :aria-label="__('Refresh')"
          @click.stop="reread"
        >
          <lucide-refresh-cw class="size-3.5" :class="links.loading && 'animate-spin'" />
        </button>
      </template>
      <div class="space-y-2 pb-3">
        <a
          v-for="link in group.links"
          :key="link.key"
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="block rounded border border-outline-gray-2 p-3 transition-colors hover:bg-surface-gray-1"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="flex min-w-0 items-center gap-1.5 text-sm font-medium text-ink-gray-8">
              <img v-if="link.icon" :src="link.icon" alt="" class="size-3.5 shrink-0 rounded-sm" />
              <span class="truncate">{{ link.key }}</span>
            </span>
            <Badge
              v-if="link.status"
              :label="link.status"
              :theme="STAGE_THEME[link.stage] || 'gray'"
              class="shrink-0"
            />
          </div>
          <p v-if="link.title" class="mt-1.5 truncate text-sm text-ink-gray-7">
            {{ link.title }}
          </p>
          <p class="mt-1 truncate text-xs text-ink-gray-5">
            {{ link.error || details(link) }}
          </p>
        </a>
      </div>
    </Section>
  </div>
</template>

<script setup lang="ts">
import { Section } from "@/components";
import { __ } from "@/translation";
import { timeAgo } from "@/utils";
import { Badge, createResource } from "frappe-ui";
import { computed, ref, watch } from "vue";
import { RECORD_ACTIONS_API, recordActionsRan, STAGE_THEME } from "./recordActions";

const props = defineProps<{ doctype: string; name: string }>();
const opened = ref(true);

// A refresh asks the other system itself rather than what the server remembers of it.
let fresh = 0;
const links = createResource({
  url: `${RECORD_ACTIONS_API}.links`,
  method: "GET",
  makeParams: () => ({ doctype: props.doctype, name: props.name, fresh }),
  onError() {}, // an older backend or a refusal shows nothing, as a record with no links does
});
// Read per record, and again after any run made something.
watch([() => props.name, recordActionsRan], ([name]) => name && links.fetch(), { immediate: true });

function reread() {
  fresh = 1;
  links.reload().finally(() => (fresh = 0));
}

const groups = computed(() => {
  const bySection = new Map<string, any[]>();
  for (const link of links.data || []) {
    bySection.set(link.section, [...(bySection.get(link.section) || []), link]);
  }
  return [...bySection].map(([section, rows]) => ({ section, links: rows }));
});

function details(link: any) {
  return [
    link.owner || __("Unassigned"),
    link.priority,
    link.updated && __("updated {0}", [timeAgo(link.updated)]),
  ]
    .filter(Boolean)
    .join(" · ");
}
</script>
