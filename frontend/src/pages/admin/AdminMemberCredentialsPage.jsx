import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../api";

export default function AdminMemberCredentialsPage() {
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("admin/member-credentials");
        setCredentials(data.credentials || []);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
        <KeyRound className="h-5 w-5 text-cyan-600" />
        Member Credentials
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Username</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Contact</th>
            </tr>
          </thead>
          <tbody>
            {credentials.map((c) => (
              <tr key={c.id} className="border-t border-slate-200 dark:border-slate-600">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.username}</td>
                <td className="px-3 py-2">{c.email}</td>
                <td className="px-3 py-2">{c.contact || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
