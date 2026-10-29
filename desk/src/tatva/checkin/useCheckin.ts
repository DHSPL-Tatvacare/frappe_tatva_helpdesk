// The check-in ask, the logout ask and the once-per-login notice, on tatva_connect's check-in endpoints with the CRM's rules (frappe_tatva_crm tatva/checkin/useCheckin.js); the status menu is Helpdesk's own, kept in step by the check-in sync.
import { globalStore } from "@/stores/globalStore";
import { __ } from "@/translation";
import { useDebounceFn, useThrottleFn } from "@vueuse/core";
import { createResource, dayjsLocal, toast } from "frappe-ui";
import { computed, ref, watch } from "vue";

const API = "tatva_connect.api.checkin";
// The server's "your card changed" push; it carries nothing, the tab re-reads get_status.
const CARD_EVENT = "tatva_checkin";

let _status: any = null;
let _set: any = null;
let _dismiss: any = null;
const dismissed = ref(false);
// The logout to finish once the agent answers the Unavailable question; null while nothing is asked.
const pendingLogout = ref<null | (() => void)>(null);
// A push that landed while the tab was hidden: the tab re-reads the moment it is seen again.
let stale = false;
let noticeShown = false;

// The one gate: only an explicit `enabled: true` shows anything; false or no reply is upstream Helpdesk.
const enabled = () => _status?.data?.enabled === true;

function resources() {
  if (_status) return;
  // No cache: the ask is a per-session answer.
  _status = createResource({
    url: `${API}.get_status`,
    method: "GET",
    onError() {},
    onSuccess: () => (dismissed.value = false),
  });
  _set = createResource({ url: `${API}.set_status`, onError() {} });
  _dismiss = createResource({ url: `${API}.dismiss_prompt`, onError() {} });
  _status.fetch().catch(() => {});
  // A tab coming back into view asks again: a shift may have opened, or another tab answered, while it was hidden.
  const recheck = useThrottleFn(() => enabled() && _status.reload(), 30000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (!stale) return recheck();
    stale = false;
    _status.reload();
  });
  // The server marks a notice told on the read that carries it, and CRM and Helpdesk share the login, so whichever app reads it shows it, in the CRM's words.
  watch(
    () => _status.data?.notice,
    (notice) => {
      if (!notice || noticeShown || !enabled()) return;
      noticeShown = true;
      const d = _status.data;
      const message =
        d.source === "Shift End"
          ? d.lead_flow?.next_at
            ? __("Your shift ended. You are Unavailable until {0}", [
                dayjsLocal(d.lead_flow.next_at).format("ddd HH:mm"),
              ])
            : __("Your shift ended. You are Unavailable")
          : __("{0} set your status to {1}", [
              d.changed_by_name || d.changed_by || __("Your manager"),
              __(d.status || "Set status"),
            ]);
      toast.info(message);
    }
  );
  // One re-read per burst of changes; a hidden tab only marks itself stale.
  const refetch = useDebounceFn(() => enabled() && _status.reload(), 1500, {
    maxWait: 5000,
  });
  globalStore().$socket?.on(CARD_EVENT, () => {
    if (document.visibilityState === "visible") refetch();
    else stale = true;
  });
}

function setCheckin(status: string) {
  return _set
    .submit({ status })
    .then((data: any) => {
      _status.setData(data);
      toast.success(__(data?.status));
      return data;
    })
    .catch((e: unknown) => {
      toast.error(__("Could not update your status"));
      throw e;
    });
}

// "Not now" (or closing the ask) is an answer: hide at once and tell the server, so today does not ask again.
function dismissPrompt() {
  dismissed.value = true;
  _dismiss.submit().catch(() => {});
}

// Asked only when check-in is on for the agent and they are Active; otherwise logs out exactly as before.
export function logoutWithCheckout(logout: () => void) {
  if (!enabled() || _status.data.status !== "Active") return logout();
  pendingLogout.value = logout;
}

// A failed status change keeps the session open so the agent can try again.
async function finishLogout(setUnavailable: boolean) {
  const logout = pendingLogout.value;
  if (!logout) return;
  if (setUnavailable && !(await setCheckin("Unavailable").catch(() => null)))
    return;
  pendingLogout.value = null;
  logout();
}

function cancelLogout() {
  pendingLogout.value = null;
}

export function useCheckin() {
  resources();
  return {
    showPrompt: computed(
      () => enabled() && !!_status.data.prompt && !dismissed.value
    ),
    saving: computed(() => _set.loading),
    setCheckin,
    dismissPrompt,
    askingLogout: computed(() => !!pendingLogout.value),
    finishLogout,
    cancelLogout,
  };
}
