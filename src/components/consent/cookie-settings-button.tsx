"use client";

import { openCookieSettings } from "./consent-manager";

/** Footer link that lets a visitor review or change their cookie choice. */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="cursor-pointer hover:text-white"
    >
      Cookie settings
    </button>
  );
}
