import React from 'react'

const LoginLeftSide = () => {
  return (
   <div className="hidden md:flex w-1/2 bg-indigo-950 relative overflow-hidden border-r border-slate-200">
    <div className="absolute -top-30 -left-30 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
    <div className="relative z-10 flex flex-col items-start justify-center p-12 lg:p-20 w-full h-full">


        <h1 className="text-4xl lg:text-5xl font-medium text-white mb-6   logo-heading ">Library <br /> Management System</h1>
        <p className="font-subheading text-slate-400 text-lg max-w-md leading-relaxed">Streamline your library operations with smart book management, seamless issue tracking, and secure student access — making learning resources organized, accessible, and efficient for everyone.
.</p>
    
    </div>
   </div>
  )
}

export default LoginLeftSide
