import "server-only";

import { openHolderAccounts } from "@/accounts/ensure";
import { GUEST_OPENING_CENTS } from "@/accounts/opening";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { hashPassword } from "@/auth/password";
import { ensureHolderCards } from "@/cards/ensure";
import { connectDb } from "@/db/connect";
import { isDuplicateKey } from "@/db/duplicate";
import { User } from "@/db/models/user";
import { setModuleState } from "@/modules/store";
import { GUEST_MODULES, GUEST_PASSWORD, guestInitials, guestPrefix, guestUsername, nextGuestNumber } from "./guest";

const MAX_ATTEMPTS = 5;

export type CreatedGuest = { userId: string; username: string };

export async function createGuest(fullName: string): Promise<CreatedGuest> {
  const initials = guestInitials(fullName);
  if (!initials) {
    throw new Error("El nombre del invitado no tiene letras.");
  }

  await connectDb();
  const passwordHash = await hashPassword(GUEST_PASSWORD);
  const guest = await insertGuest(initials, fullName, passwordHash);

  try {
    await setModuleState(guest.userId, GUEST_MODULES);
  } catch (error) {
    await User.deleteOne({ _id: guest.userId });
    throw error;
  }

  await openHolderAccounts(guest.userId, GUEST_OPENING_CENTS);
  await ensureHolderCards(guest.userId);
  return guest;
}

async function insertGuest(
  initials: string,
  fullName: string,
  passwordHash: string,
): Promise<CreatedGuest> {
  const prefix = guestPrefix(initials);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const taken = await User.find({ username: { $regex: `^${prefix}\\d+$` } })
      .select("username")
      .lean();
    const username = guestUsername(
      initials,
      nextGuestNumber(
        initials,
        taken.map((user) => String(user.username)),
      ),
    );
    try {
      const created = await User.create({
        username,
        fullName,
        passwordHash,
        role: ROLE_CUENTAHABIENTE,
      });
      return { userId: String(created._id), username };
    } catch (error) {
      if (!isDuplicateKey(error)) {
        throw error;
      }
    }
  }
  throw new Error("No se pudo reservar un usuario de invitado.");
}
