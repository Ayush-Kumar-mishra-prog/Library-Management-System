import { useEffect, useMemo, useState } from "react";
import { MessageSquare, SearchIcon, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../api";

const initialMessageForm = {
  student_id: "",
  title: "",
  message: "",
};

export default function StudentManagementPanel({ role }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [messageForm, setMessageForm] = useState(initialMessageForm);
  const [sending, setSending] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const basePath = role === "admin" ? "admin" : "member";

  const load = async () => {
    const data = await apiFetch(`${basePath}/students`);
    setStudents(data.students || []);
  };

  useEffect(() => {
    load().catch((err) => toast.error(err.message));
  }, [basePath]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) =>
      query
        ? `${student.name} ${student.university_id} ${student.email} ${student.username}`
            .toLowerCase()
            .includes(query)
        : true,
    );
  }, [search, students]);

  const handleRemove = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student account?")) {
      return;
    }
    setRemovingId(studentId);
    try {
      await apiFetch(`${basePath}/students/delete`, {
        method: "POST",
        body: JSON.stringify({ student_id: studentId }),
      });
      toast.success("Student removed");
      if (messageForm.student_id === String(studentId)) {
        setMessageForm(initialMessageForm);
      }
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  const handleMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await apiFetch(`${basePath}/students/message`, {
        method: "POST",
        body: JSON.stringify({
          student_id: Number(messageForm.student_id),
          title: messageForm.title,
          message: messageForm.message,
        }),
      });
      toast.success("Message sent to student");
      setMessageForm(initialMessageForm);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Student Directory
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-slate-900">
              Registered Students
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              View students, remove inactive accounts, and send direct messages.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 lg:max-w-md">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student by name, ID, email"
              className="border-0 bg-transparent px-0"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                Student List ({filteredStudents.length})
              </h3>
            </div>
          </div>
          {filteredStudents.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              No students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>University ID</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="font-medium text-slate-900">{student.name}</td>
                      <td>{student.university_id || "-"}</td>
                      <td>{student.email}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              setMessageForm((prev) => ({
                                ...prev,
                                student_id: String(student.id),
                              }))
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Message
                          </button>
                          <button
                            onClick={() => handleRemove(student.id)}
                            disabled={removingId === student.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {removingId === student.id ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <section className="card p-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-slate-900">Send Message</h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Student ko direct notification page par message milega.
          </p>
          <form onSubmit={handleMessage} className="mt-5 space-y-4">
            <select
              value={messageForm.student_id}
              onChange={(e) =>
                setMessageForm((prev) => ({ ...prev, student_id: e.target.value }))
              }
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.university_id || student.email})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={messageForm.title}
              onChange={(e) =>
                setMessageForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Message title"
            />
            <textarea
              rows="5"
              value={messageForm.message}
              onChange={(e) =>
                setMessageForm((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Write your message for the student"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}
