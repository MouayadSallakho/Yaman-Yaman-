import { API_CONFIG } from "./config";
import { apiRequest } from "./request";

/**
 * Thrown when there is nowhere to deliver a contact message.
 *
 * Distinct from a network or server failure on purpose: the UI phrases those
 * two situations differently, and only this one is a configuration gap rather
 * than something a retry could fix.
 */
export class ContactChannelUnavailableError extends Error {
  constructor() {
    super("No contact endpoint is configured.");
    this.name = "ContactChannelUnavailableError";
    this.code = "CONTACT_CHANNEL_UNAVAILABLE";
  }
}

/**
 * Whether a contact endpoint exists to send to.
 *
 * `API_CONFIG.ENDPOINTS` currently declares REGISTER, VERIFY and LOGIN and
 * nothing else, so this is `false` today. It is written as a lookup rather than
 * a hardcoded `false` so that wiring the real service later is a one-line
 * addition to `config.js` — no component changes, no dead branch to delete.
 *
 * Nothing invents a URL here: if the endpoint is absent, the send path refuses
 * rather than guessing a path that may not exist on the backend.
 */
export function isContactChannelConfigured() {
  return typeof API_CONFIG.ENDPOINTS.CONTACT === "string"
    && API_CONFIG.ENDPOINTS.CONTACT.length > 0;
}

export const ContactAPI = {
  isConfigured: isContactChannelConfigured,

  /**
   * Deliver a contact message.
   *
   * Resolves only on a real 2xx from a real endpoint — `apiRequest` already
   * rejects a non-OK response and a `success: false` payload. There is no
   * branch in this function that can resolve without the network having
   * answered, which is what keeps the UI from ever showing a success state for
   * a message that went nowhere.
   *
   * @param {{ name: string, email: string, subject: string, message: string }} payload
   * @returns {Promise<unknown>}
   */
  sendMessage(payload) {
    if (!isContactChannelConfigured()) {
      return Promise.reject(new ContactChannelUnavailableError());
    }

    return apiRequest({
      path: API_CONFIG.ENDPOINTS.CONTACT,
      method: "POST",
      body: payload,
    });
  },
};
