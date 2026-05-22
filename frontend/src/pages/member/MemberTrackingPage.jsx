import { useEffect, useMemo, useState } from "react";
import { BookOpenText, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../api";
import BookGallery from "../../components/BookGallery";

export default function MemberTrackingPage() {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("tracking");

  const load = async () => {
    const [dataIssues, dataBooks] = await Promise.all([
      apiFetch("member/issues"),
      apiFetch("books"),
    ]);
    setIssues(dataIssues.issues || []);
    setBooks(dataBooks.books || []);
  };

  useEffect(() => {
    load().catch((err) => toast.error(err.message));
  }, []);

  const returnBook = async (issueId) => {
    try {
      const result = await apiFetch("member/return-book", {
        method: "POST",
        body: JSON.stringify({ issue_id: issueId }),
      });
      toast.success(`Returned. Penalty: Rs ${result.penalty}`);
      await load();
      window.dispatchEvent(new Event("member-badge-refresh"));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter((book) =>
      query
        ? `${book.book_name} ${book.title} ${book.author} ${book.category}`
            .toLowerCase()
            .includes(query)
        : true,
    );
  }, [books, search]);

  return (
    <div className="space-y-5">
      <section className="card p-5">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab("tracking")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "tracking"
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            <ClipboardList className="mr-2 inline h-4 w-4" />
            Issued / Returned
          </button>
          <button
            onClick={() => setActiveTab("books")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "books"
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            <BookOpenText className="mr-2 inline h-4 w-4" />
            Books Inventory
          </button>
        </div>
      </section>

      {activeTab === "tracking" ? (
        <section className="card overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Issued / Returned Tracking
              </h2>
            </div>
          </div>
          {issues.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              No issued or returned books found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Book</th>
                    <th>Category</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Penalty</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium text-slate-900">
                        {item.student_name}
                      </td>
                      <td>{item.book_name}</td>
                      <td>{item.category || "General"}</td>
                      <td>{item.issue_date}</td>
                      <td>{item.due_date}</td>
                      <td>
                        Rs{" "}
                        {item.status === "issued"
                          ? item.live_penalty
                          : item.penalty}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.status === "issued"
                              ? "badge-warning"
                              : "badge-success"
                          } capitalize`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === "issued" ? (
                          <button
                            onClick={() => returnBook(item.id)}
                            className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Return
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <BookGallery
          title="Books Inventory"
          subtitle="Member portal me bhi same modern book-card view jaisa student portal."
          books={filteredBooks}
          search={search}
          onSearchChange={setSearch}
        />
      )}
    </div>
  );
}
