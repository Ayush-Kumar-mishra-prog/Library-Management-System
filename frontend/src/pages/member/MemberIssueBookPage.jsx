import { useEffect, useState } from "react";
import { BookPlus } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../api";

export default function MemberIssueBookPage() {
  const [issueForm, setIssueForm] = useState({
    book_id: "",
    student_id: "",
    issue_date: new Date().toISOString().slice(0, 10),
  });
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);

  const load = async () => {
    try {
      const [b, s] = await Promise.all([
        apiFetch("books"),
        apiFetch("member/students"),
      ]);
      setBooks(b.books || []);
      setStudents(s.students || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const issueBook = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("member/issue-book", {
        method: "POST",
        body: JSON.stringify(issueForm),
      });
      toast.success("Book issued");
      setIssueForm({
        book_id: "",
        student_id: "",
        issue_date: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form
      onSubmit={issueBook}
      className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm space-y-2 dark:border-slate-700 dark:bg-slate-900/50"
    >
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
        <BookPlus className="h-5 w-5 text-blue-600" />
        Issue Book to Student
      </h2>
      <select
        className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-600"
        value={issueForm.book_id}
        onChange={(e) =>
          setIssueForm({ ...issueForm, book_id: e.target.value })
        }
      >
        <option value="">Select Book</option>
        {books.map((b) => (
          <option key={b.id} value={b.id} disabled={b.available_qty < 1}>
            {b.id} - {b.title} [{b.category || "General"}] ({b.available_qty}/{b.total_qty} available)
          </option>
        ))}
      </select>
      <select
        className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-600"
        value={issueForm.student_id}
        onChange={(e) =>
          setIssueForm({ ...issueForm, student_id: e.target.value })
        }
      >
        <option value="">Select Student</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.id} - {s.name}
          </option>
        ))}
      </select>
      <input
        className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-600"
        type="date"
        value={issueForm.issue_date}
        onChange={(e) =>
          setIssueForm({ ...issueForm, issue_date: e.target.value })
        }
      />
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Book is fixed for 15 days for every syudents. After Rs 5/day penalty charges.
      </p>
      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700"
      >
        Issue
      </button>
    </form>
  );
}
