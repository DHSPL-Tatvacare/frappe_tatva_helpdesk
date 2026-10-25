<template>
  <FrappeUIProvider>
    <router-view />
  </FrappeUIProvider>
  <Dialogs />
</template>

<script setup lang="ts">
import { Dialogs } from "@/components/dialogs";
import { useConfigStore } from "@/stores/config";
import { globalStore } from "@/stores/globalStore";
import { useFavicon } from "@vueuse/core";
import { call, FrappeUIProvider, setConfig, toast, useColorScheme } from "frappe-ui";
import { storeToRefs } from "pinia";
import { h, onMounted } from "vue";
import Wifi from "~icons/lucide/wifi";
import WifiOff from "~icons/lucide/wifi-off";
import { __ } from "./translation";
import { isCustomerPortal, getBrowserTimezone } from "./utils";

const configStore = useConfigStore();
const { favicon } = storeToRefs(configStore);

useFavicon(favicon);

if (!localStorage.getItem("theme")) {
  localStorage.setItem("theme", "light");
}
useColorScheme();

onMounted(() => {
  window.addEventListener("online", () => {
    toast(__("You are now online."), {
      icon: () => h(Wifi, { class: "text-ink-base" }),
    });
  });

  window.addEventListener("offline", () => {
    toast(__("You are now offline."), {
      icon: () => h(WifiOff, { class: "text-ink-base" }),
    });
  });
  // TATVA: presence — tatva_connect serves the ONE client file and its thresholds (none for a portal customer), and it reports over the app's socket; without tatva_connect the call fails and nothing runs.
  const { $socket } = globalStore();
  call("tatva_connect.presence.client").then((c) => c && import(/* @vite-ignore */ c.url).then((m) => m.start(c, $socket))).catch(() => {});
  !isCustomerPortal.value && setConfig("localTimezone", window.timezone?.user);
  setConfig("systemTimezone", window.timezone?.system || null);
});
</script>
