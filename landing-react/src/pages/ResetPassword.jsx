import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { forgotPassword, resetPassword } from "../services/authService";

export default function ResetPassword(){
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState("");
  const [sp] = useSearchParams();
  const token = sp.get("token");
  const navigate = useNavigate();

  const onForgot = async(e)=>{ e.preventDefault(); try{ await forgotPassword(email); setMsg(t("check_email_reset")); }catch{ setMsg(t("error_sending_reset")); } };
  const onReset  = async(e)=>{ e.preventDefault(); try{ await resetPassword(token, pwd); setMsg(t("password_updated")); setTimeout(()=>navigate("/auth?mode=login"),1500);}catch{ setMsg(t("reset_failed")); } };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 rounded-xl shadow-lg p-10 space-y-6">
        {!token ? (
          <>
            <h2 className="text-2xl font-bold text-center">{t("forgot_password_title")}</h2>
            <form onSubmit={onForgot} className="space-y-4">
              <input type="email" placeholder={t("your_email")} value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full bg-transparent border-b border-gray-700 py-2 outline-none" />
              <button className="w-full bg-[#e0bd40] text-black font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition">{t("send_reset_link")}</button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center">{t("reset_password_title")}</h2>
            <form onSubmit={onReset} className="space-y-4">
              <input type="password" placeholder={t("new_password")} value={pwd} onChange={(e)=>setPwd(e.target.value)} required className="w-full bg-transparent border-b border-gray-700 py-2 outline-none" />
              <button className="w-full bg-[#e0bd40] text-black font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition">{t("update_password")}</button>
            </form>
          </>
        )}
        {msg && <p className="text-center text-gray-300 text-sm">{msg}</p>}
      </div>
    </div>
  );
}
