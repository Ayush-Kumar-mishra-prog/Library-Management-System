import { useEffect, useMemo, useState } from "react";
import { BookOpenText, SearchIcon } from "lucide-react";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import { apiFetch, toPublicFileUrl } from "../api";
import { student as fallbackCover } from "../assets/assets";

export default function StudentBooks() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("title");
  const [submittingId, setSubmittingId] = useState(null);
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [requests, setRequests] = useState([]);

  const load = async () => {
    const [bookData, issueData, requestData] = await Promise.all([
      apiFetch("books"),
      apiFetch("student/issues"),
      apiFetch("student/issue-requests"),
    ]);
    setBooks(bookData.books || []);
    setIssues(issueData.issues || []);
    setRequests(requestData.requests || []);
  };

  useEffect(() => {
    let active = true;
    const boot = async () => {
      try {
        await load();
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
    boot();
    return () => {
      active = false;
    };
  }, []);

  const requestMap = useMemo(
    () =>
      Object.fromEntries(
        requests
          .filter((item) => item.status === "pending")
          .map((item) => [item.book_id, item.status]),
      ),
    [requests],
  );

  const issuedMap = useMemo(
    () =>
      Object.fromEntries(
        issues
          .filter((item) => item.status === "issued")
          .map((item) => [item.book_id, item.status]),
      ),
    [issues],
  );

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter((book) => {
      const haystack =
        filterBy === "author"
          ? book.author
          : filterBy === "category"
            ? book.category
            : filterBy === "publish_date"
              ? book.publish_date
              : `${book.book_name} ${book.title}`;
      return query ? `${haystack || ""}`.toLowerCase().includes(query) : true;
    });
  }, [books, filterBy, search]);

  const booksByCategory = useMemo(() => {
    return filteredBooks.reduce((acc, book) => {
      const category = book.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(book);
      return acc;
    }, {});
  }, [filteredBooks]);

  const handleIssueRequest = async (bookId) => {
    setSubmittingId(bookId);
    try {
      await apiFetch("student/issue-request", {
        method: "POST",
        body: JSON.stringify({ book_id: bookId }),
      });
      toast.success("Issue request sent to member");
      await load();
      window.dispatchEvent(new Event("student-badge-refresh"));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Books Catalogue
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-slate-900">
              Available Books
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Search by title, author, category, or publish date and send issue requests directly.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:max-w-2xl lg:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3">
              <SearchIcon className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find your books"
                className="border-0 bg-transparent px-0"
              />
            </div>
            <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} className="lg:max-w-[220px]">
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="category">Category</option>
              <option value="publish_date">Published Date</option>
            </select>
          </div>
        </div>
      </section>

      {Object.keys(booksByCategory).length === 0 ? (
        <section className="card p-8 text-center text-sm text-slate-500">
          No books found for the current search.
        </section>
      ) : (
        Object.entries(booksByCategory).map(([category, categoryBooks]) => (
          <section key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpenText className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xl font-semibold text-slate-900">
                Category - <span className="text-indigo-500">{category}</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categoryBooks.map((book) => {
                const isPending = requestMap[book.id] === "pending";
                const isIssued = issuedMap[book.id] === "issued";
                const isUnavailable = Number(book.available_qty) < 1;
                const disabled = isPending || isIssued || isUnavailable || submittingId === book.id;

                let actionLabel = "Issue Book";
                if (isIssued) actionLabel = "Already Issued";
                else if (isPending) actionLabel = "Request Pending";
                else if (isUnavailable) actionLabel = "Not Available";
                else if (submittingId === book.id) actionLabel = "Sending...";

                return (
                  <article key={book.id} className="card card-hover overflow-hidden p-5">
                    <img
                      src={book.image_url ? toPublicFileUrl(book.image_url) : fallbackCover}
                      alt={book.book_name || book.title}
                      className="h-56 w-full rounded-2xl object-cover"
                    />
                    <div className="mt-4">
                      <h4 className="text-lg font-bold text-slate-900">
                        {book.book_name || book.title}
                      </h4>
                      <p className="mt-1 text-sm text-slate-700">{book.author}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {book.category || "General"} {" · "} {book.publish_date || "-"}
                      </p>
                      <p className={`mt-3 text-sm font-semibold ${isUnavailable ? "text-rose-600" : "text-emerald-600"}`}>
                        Available: {book.available_qty ?? 0} / {book.total_qty ?? 0}
                      </p>
                      <button
                        disabled={disabled}
                        onClick={() => handleIssueRequest(book.id)}
                        className="mt-4 w-full rounded-full bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {actionLabel}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
