

import React, { useState } from 'react'
import LoginLeftSide from '../components/LoginLeftSide'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, Eye, EyeOffIcon, Loader2Icon } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../api'
import { validateEmail, validateUsername } from '../utils/authValidation'

const MemberLoginPage = () => {
    const [form, setForm] = useState({
      name: "",
      username: "",
      email: "",
      university_id: "",
      password: ""
    })
    const [showPassword,setShowPassword] = useState(false)
    const [error,setError] = useState("")
    const [loading,setLoading] = useState(false)
    const navigate = useNavigate()
  
    const handleSubmint = async(e)=>{
      e.preventDefault();

      if (!form.name.trim()) {
        setError("Full name  is required .")
        return
      }

      const usernameError = validateUsername(form.username)
      if (usernameError) {
        setError(usernameError)
        return
      }

      const emailError = validateEmail(form.email)
      if (emailError) {
        setError(emailError)
        return
      }

      if (!form.university_id.trim()) {
        setError("University ID is required .")
        return
      }

      if (form.password.trim().length < 6) {
        setError("Password must be atleast 6 characters.")
        return
      }

      setLoading(true)
      setError("")
      try {
        await apiFetch("auth/signup-student", {
          method: "POST",
          body: JSON.stringify({
            ...form,
            name: form.name.trim(),
            username: form.username.trim(),
            email: form.email.trim(),
            university_id: form.university_id.trim()
          })
        })
        toast.success("Signup successful, please login.")
        navigate("/student-login")
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  return (
    <>
    <div className="min-h-screen flex flex-col md:flex-row">
       <LoginLeftSide />

        <div className="flex flex-1 items-center justify-center p-6 sm:p012 bg-white">
            <div className="w-full max-w-md animate-fade-in">
            <Link to={'/login'} className='inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm mb-10 transition-colors'>
            <ArrowLeftIcon size={16} /> Back to portals
            </Link>

            <div className="mb-8">
                <h1 className="font-heading text-2xl sm:text-3xl font-medium text-zinc-800">Register Student</h1>
                <p className="font-subheading text-slate-500 text-sm sm:text-base mt-2">Register your account to use the application</p>
            </div>
            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start gap-3">
                    <div className='w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0' />
                    {error}
                </div>
            )}
          <form onSubmit={handleSubmint}>
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-2">Full Name</label>
                                    <input type="text" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} placeholder="David" className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-2">Username</label>
                                    <input type="text" value={form.username} onChange={(e)=>setForm({ ...form, username: e.target.value })} placeholder="andrew_david" className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors" />  
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm text-gray-500 mb-2">Email id</label>
                                <input type="email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} placeholder="david@company.com" className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors"/>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm text-gray-500 mb-2">Univercity Id</label>
                                <input type="text" value={form.university_id} onChange={(e)=>setForm({ ...form, university_id: e.target.value })} placeholder="UNIV12345" className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors"/>
                            </div>

                           <div className="">
                                              <label htmlFor="" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                                              <div className="relative">
                                                  <input type={showPassword ? 'text' :'password'} value={form.password} onChange={(e)=>setForm({ ...form, password: e.target.value })} required placeholder='........' className="pr-11 w-full p-2 border border-slate-300 rounded-xl " />
                                              <button type='button' className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" onClick={()=>setShowPassword(!showPassword)}>
                                                  {showPassword ? <EyeOffIcon size={18} />: <Eye size={18}/>}
                                              </button>
                                              </div>
                                              
                                          </div>

                           
  <button type='submit' disabled={loading} className="w-full py-3 bg-indigo-950 text-white rounded-md text-sm font-semibold hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-indigo-500/25 active:scale-[0.98] flex items-center mt-4 justify-center">
                {
                    loading && <Loader2Icon className='animate-spin h-4 w-4 mr-2' />
                }  Register
                </button>
                <p className="mt-4 text-sm text-slate-500">
                  Already registered? <Link to="/student-login" className="font-medium text-indigo-600 hover:text-indigo-800">Login</Link>
                </p>
                        </form>
        </div>
        </div>
        
    </div>
    
    </>
  )
}

export default MemberLoginPage
