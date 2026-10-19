// The menu's Docs: the wiki space Tatva Platform Settings names for helpdesk, or no Docs when it names none or the wiki keeps the reader out.
import { createResource } from "frappe-ui";
import { computed } from "vue";
import { __ } from "@/translation";

const space = createResource({
  url: "tatva_connect.api.help_center.space",
  params: { app: "helpdesk" },
  cache: ["tatvaDocsSpace", "helpdesk"],
  auto: true,
});

export const docsMenuOptions = computed(() =>
  space.data
    ? [{ icon: "lucide-book-open", label: __("Docs"), onClick: () => window.open(space.data.url) }]
    : []
);
