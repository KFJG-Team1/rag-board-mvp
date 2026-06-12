import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { createId } from "../../lib/id";
import { readStorage, writeStorage } from "../../lib/storage";
import type { AccountUser, AuthUser } from "../../types";

const USERS_KEY = "mini-board.users";
const CURRENT_USER_KEY = "mini-board.current-user";

type AuthResult = {
  ok: boolean;
  message?: string;
};

type AuthContextValue = {
  currentUser: AuthUser | null;
  signUp: (username: string, password: string) => AuthResult;
  signIn: (username: string, password: string) => AuthResult;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AccountUser[]>(() =>
    readStorage<AccountUser[]>(USERS_KEY, []),
  );
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() =>
    readStorage<AuthUser | null>(CURRENT_USER_KEY, null),
  );

  const saveUsers = (nextUsers: AccountUser[]) => {
    setUsers(nextUsers);
    writeStorage(USERS_KEY, nextUsers);
  };

  const saveCurrentUser = (nextUser: AuthUser | null) => {
    setCurrentUser(nextUser);
    writeStorage(CURRENT_USER_KEY, nextUser);
  };

  const signUp = (username: string, password: string): AuthResult => {
    const normalizedUsername = username.trim();

    if (normalizedUsername.length < 2) {
      return { ok: false, message: "아이디는 2글자 이상이어야 합니다." };
    }

    if (password.length < 4) {
      return { ok: false, message: "비밀번호는 4글자 이상이어야 합니다." };
    }

    if (users.some((user) => user.username === normalizedUsername)) {
      return { ok: false, message: "이미 가입된 아이디입니다." };
    }

    const nextAccount: AccountUser = {
      id: createId("user"),
      username: normalizedUsername,
      password,
    };
    const nextAuthUser: AuthUser = {
      id: nextAccount.id,
      username: nextAccount.username,
    };

    saveUsers([...users, nextAccount]);
    saveCurrentUser(nextAuthUser);

    return { ok: true };
  };

  const signIn = (username: string, password: string): AuthResult => {
    const account = users.find(
      (user) => user.username === username.trim() && user.password === password,
    );

    if (!account) {
      return { ok: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." };
    }

    saveCurrentUser({ id: account.id, username: account.username });
    return { ok: true };
  };

  const signOut = () => {
    saveCurrentUser(null);
  };

  const value = useMemo(
    () => ({ currentUser, signUp, signIn, signOut }),
    [currentUser, users],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
