import { useState } from "react";
import { BookMarked } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../api";

export default function MemberRequestBookPage() {
  const [requestForm, setRequestForm] = useState({ title: "", author: "", message: "" });

  const requestBookFromAdmin = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("member/book-requests", { method: "POST", body: JSON.stringify(requestForm) });
      toast.success("Request sent to admin");
      setRequestForm({ title: "", author: "", message: "" });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={requestBookFromAdmin} className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm space-y-2 dark:border-slate-700 dark:bg-slate-900/50">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
        <BookMarked className="h-5 w-5 text-emerald-600" />
        Request New Book
      </h2>
      <input className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-600" placeholder="Book title" value={requestForm.title} onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })} />
      <input className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-600" placeholder="Author" value={requestForm.author} onChange={(e) => setRequestForm({ ...requestForm, author: e.target.value })} />
      <textarea className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-600" placeholder="Message" value={requestForm.message} onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })} />
      <button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700">Send Request</button>
    </form>
  );
}
