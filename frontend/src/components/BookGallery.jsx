import { SearchIcon } from "lucide-react";
import { toPublicFileUrl } from "../api";
import { student as fallbackCover } from "../assets/assets";

export default function BookGallery({
  title,
  subtitle,
  books,
  search,
  onSearchChange,
  actionRenderer,
}) {
  return (
    <section className="space-y-5">
      <div className="card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Library Collection
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 lg:max-w-md">
            <SearchIcon className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search books by title, author, category"
              className="border-0 bg-transparent px-0"
            />
          </div>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">
          No books found for the current view.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <article key={book.id} className="card card-hover overflow-hidden p-5">
              <img
                src={book.image_url ? toPublicFileUrl(book.image_url) : fallbackCover}
                alt={book.book_name || book.title}
                className="h-56 w-full rounded-2xl object-cover"
              />
              <div className="mt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {book.book_name || book.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-700">{book.author}</p>
                  </div>
                  <span className="badge badge-success whitespace-nowrap">
                    {book.category || "General"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  UID: {book.book_uid || book.book_number || book.id}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Total
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {book.total_qty ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Available
                    </p>
                    <p
                      className={`mt-1 text-lg font-bold ${
                        Number(book.available_qty) > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {book.available_qty ?? 0}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Publish Date: {book.publish_date || "-"}
                </p>
                {actionRenderer ? <div className="mt-4">{actionRenderer(book)}</div> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
