<!-- The check-in ask at login or shift start, and the Unavailable question at logout: the CRM's dialog (frappe_tatva_crm tatva/checkin/CheckinPrompt.vue), its words and buttons, on Helpdesk's own Dialog. -->
<template>
  <Dialog v-model:open="open" :title="copy.title">
    <template #default>
      <p class="text-p-base text-ink-gray-8">{{ copy.message }}</p>
    </template>
    <template #actions>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          v-for="action in actions"
          :key="action.label"
          class="w-full sm:w-auto"
          :label="action.label"
          :variant="action.variant"
          :loading="action.loading"
          @click="action.onClick"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useCheckin } from "@/tatva/checkin/useCheckin";
import { __ } from "@/translation";
import { Button, Dialog } from "frappe-ui";
import { computed } from "vue";

const {
  showPrompt,
  saving,
  setCheckin,
  dismissPrompt,
  askingLogout,
  finishLogout,
  cancelLogout,
} = useCheckin();

const copy = computed(() =>
  askingLogout.value
    ? {
        title: __("Set your status to Unavailable?"),
        message: __("Your team sees you are not working."),
      }
    : {
        title: __("Set your status to Active?"),
        message: __("Your team sees you are working."),
      }
);

const actions = computed(() =>
  askingLogout.value
    ? [
        { label: __("Log out"), onClick: () => finishLogout(false) },
        {
          label: __("Set Unavailable and log out"),
          variant: "solid",
          loading: saving.value,
          onClick: () => finishLogout(true),
        },
      ]
    : [
        { label: __("Not now"), onClick: dismissPrompt },
        {
          label: __("Set Active"),
          variant: "solid",
          loading: saving.value,
          onClick: () => setCheckin("Active").catch(() => {}),
        },
      ]
);

// Closing the login ask counts as "Not now"; closing the logout ask cancels the logout.
const open = computed({
  get: () => askingLogout.value || showPrompt.value,
  set: (v: boolean) => {
    if (v || saving.value) return;
    if (askingLogout.value) cancelLogout();
    else if (showPrompt.value) dismissPrompt();
  },
});
</script>
