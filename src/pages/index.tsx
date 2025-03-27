// src/pages/index.tsx
import React from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="p-8">
        <h1 className="text-4xl font-bold mb-6">Welcome to Blockvest</h1>
        <p className="mb-4">
          A simple dApp where users can create projects for funding, and 
          investors can invest in those projects for equity.
        </p>

        <div className="flex space-x-4">
          <Link
            href="/projects"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            View/Publish Projects
          </Link>
          <Link
            href="/profile"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            My Profile
          </Link>
        </div>
      </main>
    </div>
  );
}