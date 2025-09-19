import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signupClient, loginClient, verifyEmail } from "../services/authService";

export default function Auth() {
  const { t } = useTranslation();
  const [mode, setMode] = useState("login"); // default enterprise flow
  const [form, setForm] = useState({ company:"", regNumber:"", name:"", email:"", phone:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // open tab by URL param and verify email token if present
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode) setMode(urlMode);
    const verifyToken = searchParams.get("verify");
    if (verifyToken) {
      (async () => {
        try {
          await verifyEmail(verifyToken);
          setMessage(t("email_verified"));
          setMode("login");
        } catch {
          setMessage(t("verification_failed"));
        }
      })();
    }
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      if (mode === "login") {
        const res = await loginClient({ email: form.email, password: form.password });
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      } else {
        await signupClient(form);
        setMessage(t("check_email"));
      }
    } catch (err) {
      setMessage(err?.response?.data?.error || t("something_wrong"));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 rounded-xl shadow-lg p-10 space-y-6">
        {/* Tabs */}
        <div className="flex justify-center mb-4">
          <button onClick={() => setMode("login")}  className={`px-6 py-2 rounded-t-lg ${mode==="login"  ? "bg-[#e0bd40] text-black" : "bg-gray-800 text-gray-300"}`}>{t("login_title")}</button>
          <button onClick={() => setMode("signup")} className={`px-6 py-2 rounded-t-lg ${mode==="signup" ? "bg-[#e0bd40] text-black" : "bg-gray-800 text-gray-300"}`}>{t("signup_title")}</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {mode === "signup" ? (
            <>
              <input name="company"    placeholder={t("company_name")}              onChange={onChange} required className="w-full bg-transparent border-b border-gray-700 py-2 outline-none" />
              <input name="regNumber"  placeholder={t("reg_number")} onChange={onChange} required className="w-full bg-transparent border-b border-gray-700 py-2 outline-none" />
              <input name="name"       placeholder={t("contact_name")}             onChange={onChange} required className="w-full bg-transparent border-b border-gray-700 py-2 outline-none" />
              <input name="email" type="email" placeholder={t("email")}            onChange={onChange} required className="w-full bg-transparent border-b border-gray-700 py-2 outline-none" />
              <input name="phone"      placeholder={t("phone")}             onChange={onChange}         className="w-full bg-transparent border-b border-gray-700 py-2 outline-none" />
              <input name="password" type="password" placeholder={t("password")}   onChange={onChange} required className="w-full bg-transparent border-b border-gray-700 py-2 outline-none" />
            </>
          ) : (
            <>
              <input name="email" type="email" placeholder={t("email")}            onChange={onChange} required className="w-full bg-transparent border-b border-gray-700 py-2 outline-none" />
              <input name="password" type="password" placeholder={t("password")}   onChange={onChange} required className="w-full bg-transparent border-b border-gray-700 py-2 outline-none" />
              <div className="text-right text-sm">
                <a href="/reset-password" className="text-[#e0bd40] hover:text-yellow-400">{t("forgot_password")}</a>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#e0bd40] text-black font-semibold px-8 py-3 rounded-xl shadow-lg text-lg hover:bg-yellow-400 transition">
            {loading ? t("processing") : (mode==="login" ? t("login_title") : t("create_account"))}
          </button>
        </form>

        {message && <p className="text-center text-gray-300 text-sm">{message}</p>}
      </div>
    </div>
  );
}