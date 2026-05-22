import { useState } from "react";
import { BookPlus, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch, apiUpload } from "../../api";
import { BOOK_CATEGORIES } from "../../constants/bookCategories";

const initialBook = {
  book_uid: "",
  book_number: "",
  book_name: "",
  title: "",
  description: "",
  author: "",
  publish_date: "",
  image_url: "",
  total_qty: 1,
  category: BOOK_CATEGORIES[0],
};

export default function AdminAddBookPage() {
  const [book, setBook] = useState(initialBook);
  const [bookImageFile, setBookImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const addBook = async (e) => {
    e.preventDefault();
    if (!bookImageFile) {
      toast.error("Please select a book image file");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("image", bookImageFile);
      const upload = await apiUpload("admin/upload-book-image", formData);
      await apiFetch("admin/books", {
        method: "POST",
        body: JSON.stringify({ ...book, image_url: upload.path }),
      });
      toast.success("Book added successfully");
      setBook(initialBook);
      setBookImageFile(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Books Registry
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-slate-900">
              Add New Book
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Library catalogue me new title add karne ke liye complete details fill karein.
            </p>
          </div>
          <button
            type="submit"
            form="admin-add-book-form"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <BookPlus className="h-4 w-4" />
            {saving ? "Saving..." : "Add Book"}
          </button>
        </div>
      </section>

      <form
        id="admin-add-book-form"
        onSubmit={addBook}
        className="card space-y-5 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-600">Book UID</label>
            <input
              value={book.book_uid}
              onChange={(e) => setBook({ ...book, book_uid: e.target.value })}
              placeholder="Unique book UID"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-600">Book Number</label>
            <input
              value={book.book_number}
              onChange={(e) => setBook({ ...book, book_number: e.target.value })}
              placeholder="Book number"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-600">Book Name</label>
            <input
              value={book.book_name}
              onChange={(e) => setBook({ ...book, book_name: e.target.value })}
              placeholder="Displayed book name"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-600">Title</label>
            <input
              value={book.title}
              onChange={(e) => setBook({ ...book, title: e.target.value })}
              placeholder="Formal title"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-600">Author</label>
            <input
              value={book.author}
              onChange={(e) => setBook({ ...book, author: e.target.value })}
              placeholder="Author name"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-600">Publish Date</label>
            <input
              type="date"
              value={book.publish_date}
              onChange={(e) => setBook({ ...book, publish_date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-600">Total Quantity</label>
            <input
              type="number"
              min="1"
              value={book.total_qty}
              onChange={(e) => setBook({ ...book, total_qty: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-600">Category</label>
            <select
              value={book.category}
              onChange={(e) => setBook({ ...book, category: e.target.value })}
            >
              {BOOK_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-600">Description</label>
          <textarea
            rows="5"
            value={book.description}
            onChange={(e) => setBook({ ...book, description: e.target.value })}
            placeholder="Book summary or notes"
          />
        </div>

        <div>
          <label className="mb-2 inline-flex items-center gap-2 text-sm text-slate-600">
            <ImagePlus className="h-4 w-4" />
            Book Image
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setBookImageFile(e.target.files?.[0] || null)}
          />
        </div>
      </form>
    </div>
  );
}
