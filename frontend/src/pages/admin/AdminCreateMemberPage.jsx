import { useState } from "react";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../api";
import { validateEmail, validateUsername } from "../../utils/authValidation";

export default function AdminCreateMemberPage() {
  const [member, setMember] = useState({
    name: "",
    university_id: "",
    position: "",
    faculty: "",
    department: "",
    batch: "",
    contact: "",
    email: "",
    username: "",
    password: ""
  });

  const createMember = async (e) => {
    e.preventDefault();
    const usernameError = validateUsername(member.username);
    if (usernameError) {
      toast.error(usernameError);
      return;
    }
    const emailError = validateEmail(member.email);
    if (emailError) {
      toast.error(emailError);
      return;
    }
    try {
      await apiFetch("admin/members", { method: "POST", body: JSON.stringify(member) });
      toast.success("Member created successfully");
      setMember({
        name: "",
        university_id: "",
        position: "",
        faculty: "",
        department: "",
        batch: "",
        contact: "",
        email: "",
        username: "",
        password: ""
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={createMember} className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm space-y-3 dark:border-slate-700 dark:bg-slate-900/50">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
        <UserPlus className="h-5 w-5 text-emerald-600" />
        Create Member
      </h2>
      {Object.keys(member).map((key) => (
        <input
          key={key}
          className="w-full rounded-xl border border-slate-200 p-2.5 text-sm dark:border-slate-600"
          placeholder={key.replaceAll("_", " ")}
          type={key === "password" ? "password" : "text"}
          value={member[key]}
          onChange={(e) => setMember({ ...member, [key]: e.target.value })}
        />
      ))}
      <button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700">
        Create Member
      </button>
    </form>
  );
}
