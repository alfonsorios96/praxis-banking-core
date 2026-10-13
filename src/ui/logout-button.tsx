"use client";

import { useRef } from "react";
import { logout } from "@/app/actions/auth";
import { clearDeviceToken, readDeviceToken } from "@/notifications/storage";

export function LogoutButton() {
  const tokenInput = useRef<HTMLInputElement>(null);

  return (
    <form action={logout}>
      <input ref={tokenInput} type="hidden" name="deviceToken" defaultValue="" />
      <button
        type="submit"
        className="min-h-11 px-2 text-sm font-medium text-accent"
        onClick={() => {
          if (tokenInput.current) {
            tokenInput.current.value = readDeviceToken();
          }
          clearDeviceToken();
        }}
      >
        Salir
      </button>
    </form>
  );
}
