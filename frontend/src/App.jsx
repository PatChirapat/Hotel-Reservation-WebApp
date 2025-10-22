import { useState } from 'react'

import './App.css'

export default function App() {
  return (
    <div className="flex items-center gap-3 p-6">
      <div className="w-8 h-8 bg-primary"></div>
      <div className="w-8 h-8 bg-secondary"></div>
      <div className="w-8 h-8 bg-accent"></div>
      <div className="flex gap-2 p-6">
        <button className="btn bg-primary text-primary-content">Primary</button>
        <button className="btn bg-secondary text-secondary-content">Secondary</button>
        <button className="btn bg-accent text-accent-content">Accent</button>
      </div>
    </div>
    
  )
}

