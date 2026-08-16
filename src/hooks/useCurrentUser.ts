"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth.service";
import { toUserProfile } from "@/lib/mappers";
import { currentUser as fallbackUser, type UserProfile } from "@/data/dashboard";

export type CurrentUserState = {
  user: UserProfile;
  /** False while loading or when the request failed and the fixture is showing. */
  isLive: boolean;
  isLoading: boolean;
};

/**
 * Loads the signed-in user, falling back to the fixture profile so the screens
 * stay demonstrable without a session.
 */
export function useCurrentUser(): CurrentUserState {
  const [state, setState] = useState<CurrentUserState>({
    user: fallbackUser,
    isLive: false,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((user) => {
        if (!cancelled) setState({ user: toUserProfile(user), isLive: true, isLoading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ user: fallbackUser, isLive: false, isLoading: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
