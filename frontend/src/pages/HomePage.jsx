import React from "react";
import { Link } from "react-router-dom";
import { LibraryBig } from "lucide-react";

const HomePage = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      <section className="flex flex-col items-center bg-linear-to-b from-[#D9D9FF] to-[#F8F3F9] px-4 py-4">
        <nav className="flex w-full max-w-3xl items-center justify-between gap-8 rounded-full border border-white bg-white/60 px-4 py-2.5 shadow-lg md:px-2">
          <a href="#" className="flex items-center md:pl-3">
            <LibraryBig size={30} color="indigo" />
          </a>
          <div className="hidden h-8 w-0.5 bg-gray-50 md:flex" />
          <div
            id="menu"
            className={`max-md:absolute max-md:left-0 max-md:top-0 max-md:flex max-md:h-[785px] max-md:w-0 max-md:flex-col max-md:justify-center max-md:overflow-hidden max-md:bg-white/70 max-md:backdrop-blur max-md:transition-[width] max-md:duration-300 flex-1 items-center gap-8 z-50 md:gap-10 ${mobileOpen ? "max-md:w-full" : ""}`}
          >
            <a
              href=""
              className="text-center text-3xl text-indigo-950 hover:text-purple-900"
            >
              Library Management System
            </a>

            <button
              id="close-menu"
              onClick={() => setMobileOpen(false)}
              className="aspect-square rounded-md bg-violet-500 p-2 font-medium text-white transition active:bg-violet-600 md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 md:pr-1">
            <Link
              to="/login"
              className="hidden cursor-pointer rounded-full bg-violet-600 px-4 py-2 text-xs text-white transition hover:bg-violet-700 md:inline-block md:px-6 md:py-3 md:text-sm"
            >
              Get Started
            </Link>

            <button
              id="open-menu"
              onClick={() => setMobileOpen(true)}
              className="aspect-square rounded-md p-2 font-medium text-gray-700 transition md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12h16" />
                <path d="M4 18h16" />
                <path d="M4 6h16" />
              </svg>
            </button>
          </div>
        </nav>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-full border border-white bg-white/50 py-1.5 pl-2 pr-4">
          <div className="relative flex size-3.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75 duration-300" />
            <span className="relative inline-flex size-2 rounded-full bg-green-600" />
          </div>
          <p className="text-sm text-black/60">
            Join 100+ books and growup your skill
          </p>
        </div>

        <h1 className="mt-8 max-w-2xl bg-clip-text text-center font-heading text-4xl font-medium leading-tight text-gray-800 md:text-[66px]/19">
          Oragnize, Manage and Track your Books Easily
        </h1>
        <p className="mt-4 max-w-[630px] text-center font-subheading text-sm text-gray-600">
          The library management system is a morden digital plateform designed
          to simplify and automate library oprations. It helps administrators
          manage books, students,mebership,issue-returns records and fines
          efficently through an easy-to-use interface
        </p>

        <div className="mt-10 flex gap-3">
          <Link
            to="/login"
            className="cursor-pointer rounded-lg bg-violet-600 px-6 py-3 text-xs text-white transition hover:bg-violet-700 md:text-sm"
          >
            Get Started Now
          </Link>
          <Link
            to="/login"
            className="cursor-pointer rounded-lg border border-violet-400 bg-white px-5 py-3 text-xs text-gray-600 transition hover:bg-white/5 md:text-sm"
          >
            Issuea book
          </Link>
        </div>

        <div className="mt-10 h-[3px] w-full max-w-[800px] bg-linear-to-r from-white/10 via-violet-600 to-white/10" />

        <div className="grid w-full max-w-[930px] grid-cols-2 gap-8 py-18 md:grid-cols-4">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-gray-800 md:text-3xl">
              100+
            </h2>
            <p className="text-xs text-gray-500 md:text-sm">Books Available</p>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-medium text-gray-800 md:text-3xl">
              125+
            </h2>
            <p className="text-xs text-gray-500 md:text-sm">Members are here</p>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-medium text-gray-800 md:text-3xl">
              5k+
            </h2>
            <p className="text-xs text-gray-500 md:text-sm">Happy Customers</p>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-medium text-gray-800 md:text-3xl">
              5+
            </h2>
            <p className="text-xs text-gray-500 md:text-sm">Countries</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
