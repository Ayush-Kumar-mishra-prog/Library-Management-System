import { Eye, EyeOffIcon, Loader2Icon, Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import { apiFetch } from "../api";

const initialForm = {
  name: "",
  username: "",
  email: "",
  university_id: "",
  faculty: "",
  department: "",
  batch: "",
  contact: "",
  password: "",
};

export default function Settings() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const data = await apiFetch("student/profile");
        if (!active) return;
        setForm({
          ...initialForm,
          ...data.profile,
          password: "",
        });
      } catch (err) {
        if (active) {
          toast.error(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) {
        delete payload.password;
      }
      const data = await apiFetch("student/profile", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const existingUser = JSON.parse(localStorage.getItem("user") || "null");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          name: data.profile?.name || form.name,
          username: data.profile?.username || form.username,
          email: data.profile?.email || form.email,
          department: data.profile?.department || form.department,
        }),
      );
      window.dispatchEvent(new Event("session-user-updated"));

      setForm((prev) => ({
        ...prev,
        ...data.profile,
        password: "",
      }));
      toast.success(data.message || "Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
          Account Settings
        </p>
        <h2 className="mt-2 font-heading text-3xl font-bold text-slate-900">
          Update Your Credentials
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Profile fields database se load ho rahe hain. Changes save karne par backend validation apply hogi.
        </p>
      </section>

      <section className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-600">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-600">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="Username"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-600">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-600">University ID</label>
              <input
                type="text"
                value={form.university_id}
                onChange={(e) => handleChange("university_id", e.target.value)}
                placeholder="University ID"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-600">Faculty</label>
              <input
                type="text"
                value={form.faculty}
                onChange={(e) => handleChange("faculty", e.target.value)}
                placeholder="Faculty"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-600">Department</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => handleChange("department", e.target.value)}
                placeholder="Department"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-600">Batch</label>
              <input
                type="text"
                value={form.batch}
                onChange={(e) => handleChange("batch", e.target.value)}
                placeholder="Batch"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-600">Contact</label>
              <input
                type="text"
                value={form.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-600">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Leave blank to keep current password"
                className="pr-11"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Updating..." : "Update Credentials"}
          </button>
        </form>
      </section>
    </div>
  );
}
