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
        className="btn-quiet"
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
