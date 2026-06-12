import { useState } from "react";
import { useAuth } from "./AuthContext";

type AuthMode = "login" | "signup";

export function AuthPanel() {
  const { currentUser, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result =
      mode === "login" ? signIn(username, password) : signUp(username, password);

    if (!result.ok) {
      setErrorMessage(result.message ?? "요청을 처리하지 못했습니다.");
      return;
    }

    setUsername("");
    setPassword("");
    setErrorMessage("");
  };

  if (currentUser) {
    return (
      <section className="panel auth-panel">
        <div>
          <p className="eyebrow">로그인 중</p>
          <h2>{currentUser.username}</h2>
        </div>
        <button className="button button-secondary" type="button" onClick={signOut}>
          로그아웃
        </button>
      </section>
    );
  }

  return (
    <section className="panel auth-panel">
      <div>
        <p className="eyebrow">계정</p>
        <h2>{mode === "login" ? "로그인" : "회원가입"}</h2>
      </div>

      <div className="segmented-control" aria-label="계정 모드">
        <button
          className={mode === "login" ? "active" : ""}
          type="button"
          onClick={() => {
            setMode("login");
            setErrorMessage("");
          }}
        >
          로그인
        </button>
        <button
          className={mode === "signup" ? "active" : ""}
          type="button"
          onClick={() => {
            setMode("signup");
            setErrorMessage("");
          }}
        >
          회원가입
        </button>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <label>
          아이디
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="아이디"
            autoComplete="username"
          />
        </label>
        <label>
          비밀번호
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>
        {errorMessage && <p className="form-error">{errorMessage}</p>}
        <button className="button button-primary" type="submit">
          {mode === "login" ? "로그인" : "가입하기"}
        </button>
      </form>
    </section>
  );
}
