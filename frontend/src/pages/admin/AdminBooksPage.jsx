import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../api";
import BookGallery from "../../components/BookGallery";

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    const data = await apiFetch("books");
    setBooks(data.books || []);
  };

  const handleDelete = async (bookId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this book? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(bookId);
    try {
      await apiFetch("admin/books/delete", {
        method: "POST",
        body: JSON.stringify({ book_id: bookId }),
      });
      toast.success("Book deleted successfully");
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    load().catch((err) => toast.error(err.message));
  }, []);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter((book) =>
      query
        ? `${book.book_name} ${book.title} ${book.author} ${book.category} ${book.book_uid}`
            .toLowerCase()
            .includes(query)
        : true,
    );
  }, [books, search]);

  return (
    <BookGallery
      title="Books Added by Admin"
      subtitle="Student portal jaise visual inventory view ke saath complete library catalogue."
      books={filteredBooks}
      search={search}
      onSearchChange={setSearch}
      actionRenderer={(book) => (
        <button
          onClick={() => handleDelete(book.id)}
          disabled={deleting === book.id}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          {deleting === book.id ? "Deleting..." : "Delete Book"}
        </button>
      )}
    />
  );
}
