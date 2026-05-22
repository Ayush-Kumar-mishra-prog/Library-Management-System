// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { ArrowLeft, KeyRound, ShieldCheck, UserRound, UserSquare2, GraduationCap } from "lucide-react";
// import toast from "react-hot-toast";
// import { apiFetch } from "../api";
// import { login } from "../assets/assets";
// import AuthShell from "../components/AuthShell";

// export default function LoginPage() {
//   const [form, setForm] = useState({ identity: "", password: "" });
//   const [selectedRole, setSelectedRole] = useState("student");
//   const navigate = useNavigate();

//   const submit = async (e) => {
//     e.preventDefault();
//     try {
//       const data = await apiFetch("auth/login", {
//         method: "POST",
//         body: JSON.stringify({ ...form, role: selectedRole })
//       });
//       if (data.user.role !== selectedRole) {
//         toast.error(`This account is not a ${selectedRole} account.`);
//         return;
//       }
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));
//       toast.success("Login successful");
//       navigate(`/${data.user.role}`);
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };

//   return (
//     <AuthShell
//       title="Welcome Back"
//       subtitle="Securely access your library dashboard and manage everything from one place."
//       backgroundImage={login}
//     >
//       <form onSubmit={submit} className="w-full max-w-md space-y-4">
//         <button
//           type="button"
//           onClick={() => navigate("/")}
//           className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-purple-400/40 dark:text-purple-100 dark:hover:bg-purple-500/10"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           Back
//         </button>
//         <h1 className="text-3xl font-bold text-fuchsia-600 dark:text-purple-50">Log In-------</h1>
//         <p className="text-sm text-slate-600 dark:text-purple-200">Use your username or email to continue.</p>

//         <div>
//           <p className="mb-2 text-sm font-medium text-slate-700 dark:text-purple-100">Login as</p>
//           <div className="grid grid-cols-3 gap-2">
//             {[
//               { key: "student", label: "Student", icon: GraduationCap },
//               { key: "member", label: "Member", icon: UserSquare2 },
//               { key: "admin", label: "Admin", icon: ShieldCheck }
//             ].map((roleItem) => (
//               <button
//                 type="button"
//                 key={roleItem.key}
//                 onClick={() => setSelectedRole(roleItem.key)}
//                 className={`rounded-xl border px-2 py-2 text-xs font-semibold sm:text-sm transition ${
//                   selectedRole === roleItem.key
//                     ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-purple-300 dark:bg-purple-500/20 dark:text-purple-50"
//                     : "border-slate-200 text-slate-600 dark:border-purple-300/40 dark:text-purple-200 hover:bg-slate-100/60 dark:hover:bg-purple-500/10"
//                 }`}
//               >
//                 <span className="inline-flex items-center gap-1">
//                   <roleItem.icon className="h-4 w-4" />
//                   {roleItem.label}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>

//         <label className="block">
//           <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-purple-100">Username / Email</span>
//           <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 dark:border-purple-300/40 dark:bg-[#120a1f] dark:focus-within:border-purple-300">
//             <UserRound className="h-4 w-4 text-slate-400 dark:text-purple-200" />
//             <input
//               className="w-full rounded-xl border-0 bg-transparent py-3 text-slate-900 outline-none dark:text-purple-50"
//               placeholder="Enter username or email"
//               value={form.identity}
//               onChange={(e) => setForm({ ...form, identity: e.target.value })}
//             />
//           </div>
//         </label>

//         <label className="block">
//           <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-purple-100">Password</span>
//           <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 dark:border-purple-300/40 dark:bg-[#120a1f] dark:focus-within:border-purple-300">
//             <KeyRound className="h-4 w-4 text-slate-400 dark:text-purple-200" />
//             <input
//               className="w-full rounded-xl border-0 bg-transparent py-3 text-slate-900 outline-none dark:text-purple-50"
//               type="password"
//               placeholder="Enter password"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//             />
//           </div>
//         </label>

//         <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 dark:bg-purple-500 dark:hover:bg-purple-400">
//           Login
//         </button>

//         {selectedRole === "student" && (
//           <p className="text-sm text-slate-600 dark:text-purple-200">
//             Don't have an account{" "}
//             <Link className="font-semibold text-blue-600 dark:text-purple-300" to="/signup">
//               Sign up
//             </Link>
//           </p>
//         )}
//       </form>
//     </AuthShell>
//   );
// }






import React from 'react'
import { Link } from 'react-router-dom'
import LoginLeftSide from '../components/LoginLeftSide'
import { ArrowRightIcon, ShieldIcon, User2, User2Icon } from 'lucide-react'

const LoginPage = () => {
  const portalOptions = [
    {
      to:'/admin-login',
      title:'Admin Portal',
      description:'Manage books,deparatments,members and system configuration',
      icon: ShieldIcon
    },
    {
      to:'/student-login',
      title:'Student Portal',
      description:'Issue books,Read books, reissue the book and track your books',
      icon: User2Icon
    },
    {
      to:'/member-login',
      title:'Member Portal',
      description:'Issue books,Read books, reissue the book and track your books',
      icon: User2
    },
  ]
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <LoginLeftSide />

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative overflow-y-auto min-h-screen">
      
      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h2 className="font-heading text-3xl font-medium text-slate-900 -tracking-tight mb-3">Welcome Back</h2>
          <p className="font-subheading text-slate-500">Select your portal to securely access the system.</p>
        </div>
        {/* Portals list */}

        <div className="space-y-4">
          {
            portalOptions.map((portal)=>(
              <Link key={portal.to} to={portal.to} className='group block bg-slate-50 border border-slate-200 rounded-lg p-5 sm:p-6 transiton-all duration-300 hover:border-indigo-400 hover:bg-indigo-50'>
                <div className="relative z-10 flex items-center justify-between gap-4 sm:gap-5">
                  <h3 className="font-subheading text-lg text-slate-800 group-hover:text-indigo-600 mb-1 transition-colors">{portal.title}</h3>
                  <ArrowRightIcon className='w-4 h-4 text-slate-400 grorp-hover:text-indigo-600 group-hover:translate-x- transition-all duration-300' />
                </div>

              </Link>
            ))
          }
        </div>
        {/* footer */}
        <div className="mt-12 text-center md:text-left text-sm text-slate-400">
          @ {new Date().getFullYear()} Ayush Kumar Miahra. All rights reserved
        </div>
      </div>
      
      </div>

    </div>
  )
}

export default LoginPage
