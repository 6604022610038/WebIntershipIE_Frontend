import { useState } from "react";
import { api } from "../../services/api";
import "./Login.css";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
  e.preventDefault();

  if (!username.trim() || !password.trim()) {
    setError("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: username.trim(),
        password,
      }),
    });

    localStorage.setItem(
      "internship_token",
      data.token
    );

    localStorage.setItem(
      "internship_user",
      JSON.stringify(data.user)
    );

    if (data.user?.role === "admin") {
      localStorage.setItem(
        "internship_page",
        "advisor-qa"
      );
    } else if (data.user?.role === "advisor") {
      localStorage.setItem(
        "internship_page",
        "advisor-dashboard"
      );
    } else {
      localStorage.setItem(
        "internship_page",
        "dashboard"
      );
    }

    onLogin(data.user);

  } catch (err) {
    setError(
      err.message ||
        "ไม่สามารถเข้าสู่ระบบได้"
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="login-page">

      {/* =========================
          LEFT SIDE
      ========================= */}

      <section className="login-left">

        {/* Logo / Brand */}

        <div className="login-brand">

          <div className="brand-logo">
            <div className="logo-symbol">
              ♜
            </div>
          </div>

          <div className="brand-text">
            <h2>
              ระบบติดตามฝึกงานนักศึกษา
            </h2>

            <p>
              มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน
            </p>
          </div>

        </div>


        {/* Introduction */}

        <div className="login-intro">

          <h1>
            ก้าวแรกสู่อนาคตที่ดีกว่า
          </h1>

          <p className="intro-text">
            ติดตามการฝึกงาน&nbsp;&nbsp;
            เรียนรู้&nbsp;&nbsp;
            พัฒนาตนเอง
            <br />
            ไปด้วยกัน
          </p>

        </div>


        {/* Features */}

        <div className="login-features">

          <div className="feature-item">

            <div className="feature-icon">
              🎓
            </div>

            <strong>
              ติดตาม
            </strong>

            <span>
              การฝึกงาน
            </span>

          </div>


          <div className="feature-item">

            <div className="feature-icon">
              ▤
            </div>

            <strong>
              ส่งรายงาน
            </strong>

            <span>
              ออนไลน์
            </span>

          </div>


          <div className="feature-item">

            <div className="feature-icon">
              ↗
            </div>

            <strong>
              พัฒนาทักษะ
            </strong>

            <span>
              สู่อนาคต
            </span>

          </div>


          <div className="feature-item">

            <div className="feature-icon">
              👥
            </div>

            <strong>
              เชื่อมต่อ
            </strong>

            <span>
              กับอาจารย์และสถานประกอบการ
            </span>

          </div>

        </div>


        {/* =========================
            CAMPUS ILLUSTRATION
        ========================= */}

        <div className="campus-illustration">

          <div className="sun"></div>

          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>


          {/* Building */}

          <div className="campus-building">

            <div className="building-roof"></div>

            <div className="building-body">

              <div className="building-window"></div>
              <div className="building-window"></div>
              <div className="building-window"></div>
              <div className="building-window"></div>
              <div className="building-window"></div>
              <div className="building-window"></div>

            </div>

          </div>


          {/* Students */}

          <div className="student-group">

            <div className="student student-1">

              <div className="student-head"></div>

              <div className="student-body">
                <div className="student-shirt"></div>
              </div>

              <div className="student-leg left"></div>
              <div className="student-leg right"></div>

            </div>


            <div className="student student-2">

              <div className="student-head"></div>

              <div className="student-body">
                <div className="student-shirt"></div>
              </div>

              <div className="student-leg left"></div>
              <div className="student-leg right"></div>

            </div>


            <div className="student student-3">

              <div className="student-head"></div>

              <div className="student-body">
                <div className="student-shirt"></div>
              </div>

              <div className="student-leg left"></div>
              <div className="student-leg right"></div>

            </div>


            <div className="student student-4">

              <div className="student-head"></div>

              <div className="student-body">
                <div className="student-shirt"></div>
              </div>

              <div className="student-leg left"></div>
              <div className="student-leg right"></div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          RIGHT SIDE
      ========================= */}

      <section className="login-right">

        <div className="login-card">

          {/* Login Icon */}

          <div className="login-card-icon">
            🎓
          </div>


          <h1>
            เข้าสู่ระบบ
          </h1>

          <p className="login-description">
            กรุณาเข้าสู่ระบบเพื่อใช้งาน
            ระบบติดตามฝึกงานนักศึกษา
          </p>


          {/* =========================
              FORM
          ========================= */}

          <form onSubmit={handleLogin}>

            {/* Username */}

            <div className="login-input">

              <span className="input-icon">
                ♙
              </span>

              <input
                type="text"
                placeholder="ชื่อผู้ใช้งาน / รหัสนักศึกษา"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                autoComplete="username"
                disabled={loading}
              />

            </div>


            {/* Password */}

            <div className="login-input">

              <span className="input-icon password-icon">
                🔒
              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                disabled={loading}
              >
                {showPassword ? "◉" : "◌"}
              </button>

            </div>


            {/* Error */}

            {error && (
              <div className="login-error">
                <span>⚠️</span>
                {error}
              </div>
            )}


            {/* Remember / Forgot */}

            <div className="login-options">

              <label className="remember-option">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(
                      e.target.checked
                    )
                  }
                />

                <span>
                  จดจำการเข้าสู่ระบบ
                </span>

              </label>


              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  alert(
                    "กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน"
                  )
                }
              >
                ลืมรหัสผ่าน?
              </button>

            </div>


            {/* Login Button */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              <span className="login-submit-icon">
                ⇥
              </span>

              <span>
                {loading
                  ? "กำลังเข้าสู่ระบบ..."
                  : "เข้าสู่ระบบ"}
              </span>

            </button>

          </form>


          {/* Divider */}

          <div className="login-divider">

            <span></span>

            <p>
              หรือ
            </p>

            <span></span>

          </div>


          {/* University Login */}

          <button
            type="button"
            className="university-login"
            onClick={() =>
              alert(
                "ระบบเข้าสู่ระบบด้วยมหาวิทยาลัยจะเปิดให้ใช้งานเร็ว ๆ นี้"
              )
            }
          >

            <span className="university-icon">
              🏫
            </span>

            <span>
              เข้าสู่ระบบด้วยมหาวิทยาลัย
            </span>

          </button>


          {/* Information */}

          <div className="login-info">

            <div className="info-symbol">
              i
            </div>

            <div className="info-text">

              <strong>
                สำหรับนักศึกษา อาจารย์
                และสถานประกอบการ
              </strong>

              <p>
                หากยังไม่มีบัญชี
                กรุณาติดต่อผู้ดูแลระบบของคณะ/สาขา
              </p>

            </div>

          </div>

        </div>


        {/* Footer */}

        <div className="login-footer">

          <span>
            © 2025 ระบบติดตามฝึกงาน มทร.อีสาน
          </span>

          <span className="footer-separator">
            |
          </span>

          <span>
            สงวนลิขสิทธิ์
          </span>

        </div>

      </section>

    </div>
  );
}