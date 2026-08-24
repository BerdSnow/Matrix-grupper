'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { Users, Presentation, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [exerciseCount, setExerciseCount] = useState(4);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setLoading(true);
    const socket = getSocket();
    socket.emit('create_lobby', { exerciseCount }, (res: any) => {
      if (res.success) {
        router.push(`/instructor/${res.lobby.code}`);
      }
      setLoading(false);
    });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      router.push(`/join/${joinCode.toUpperCase().trim()}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between shadow-xl">
          <div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 w-fit rounded-xl mb-6">
              <Presentation className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Create a Lobby</h2>
            <p className="text-slate-400 text-sm mb-6">
              Generate a balanced exercise session for your class.
            </p>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">
                Number of Exercises
              </label>
              <input
                type="number"
                min="2"
                max="12"
                value={exerciseCount}
                onChange={(e) => setExerciseCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {loading ? 'Initializing...' : 'Launch Instructor Board'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between shadow-xl">
          <div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 w-fit rounded-xl mb-6">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Join a Lobby</h2>
            <p className="text-slate-400 text-sm mb-6">
              Enter the session code from the screen to receive your assignment.
            </p>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">
                  5-Letter Lobby Code
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="e.g. A9B2C"
                  className="w-full uppercase tracking-widest bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                Enter Session
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}