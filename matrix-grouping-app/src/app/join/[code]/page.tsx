'use client';

import { use, useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { Lobby, Student } from '@/types';
import { BookOpen, Users2, ArrowRight } from 'lucide-react';

export default function StudentPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [lobby, setLobby] = useState<Lobby | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on('lobby_state', (updatedLobby: Lobby) => {
      setLobby(updatedLobby);
      if (currentStudent) {
        const me = updatedLobby.students.find((s) => s.id === currentStudent.id);
        if (me) setCurrentStudent(me);
      }
    });

    socket.on('groups_formed', (updatedLobby: Lobby) => {
      setLobby(updatedLobby);
      if (currentStudent) {
        const me = updatedLobby.students.find((s) => s.id === currentStudent.id);
        if (me) setCurrentStudent(me);
      }
    });

    return () => {
      socket.off('lobby_state');
      socket.off('groups_formed');
    };
  }, [currentStudent]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const socket = getSocket();
    socket.emit('student_join', { code, name }, (res: any) => {
      if (res.success) {
        setJoined(true);
        setCurrentStudent(res.student);
        setLobby(res.lobby);
      } else {
        alert(res.message);
      }
    });
  };

  if (!joined) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          <h1 className="text-xl font-bold mb-1">Enter Session</h1>
          <p className="text-xs font-mono text-indigo-400 mb-6 uppercase">Room: {code}</p>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">
                Your Full Name / Alias
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              Get Exercise
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (lobby?.status === 'GROUPED' && currentStudent) {
    const myGroup = lobby.groups.find((g) =>
      g.members.some((m) => m.id === currentStudent.id)
    );

    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-center items-center">
        <div className="max-w-md w-full space-y-6">
          <div className="bg-emerald-950/40 border border-emerald-800 p-6 rounded-2xl text-center">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Matrix Stage Activated
            </span>
            <h1 className="text-3xl font-black text-white mt-1">{myGroup?.name}</h1>
            <p className="text-xs text-slate-400 mt-2">
              You represent <strong className="text-emerald-300">Exercise {currentStudent.exerciseId}</strong> in this group.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-4">
              Your Group Peers
            </h3>
            <div className="space-y-3">
              {myGroup?.members.map((member) => (
                <div
                  key={member.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-sm ${
                    member.id === currentStudent.id
                      ? 'bg-emerald-900/20 border-emerald-700 font-bold'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <span>{member.name} {member.id === currentStudent.id && '(You)'}</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">
                    Exercise {member.exerciseId}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const exercisePeers =
    lobby?.students.filter(
      (s) => s.exerciseId === currentStudent?.exerciseId && s.id !== currentStudent?.id
    ) || [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-center items-center">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-indigo-950/40 border border-indigo-800 p-6 rounded-2xl text-center">
          <div className="p-3 bg-indigo-500/20 text-indigo-300 w-fit mx-auto rounded-full mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
            Assigned Topic
          </span>
          <h1 className="text-4xl font-black text-white mt-1">
            Exercise {currentStudent?.exerciseId}
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Work with your exercise peers until the instructor forms matrix groups.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Users2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Peers on Exercise {currentStudent?.exerciseId} ({exercisePeers.length})
            </h3>
          </div>
          <div className="space-y-2">
            {exercisePeers.map((peer) => (
              <div
                key={peer.id}
                className="bg-slate-950 border border-slate-800/80 px-3 py-2 rounded-lg text-sm text-slate-300"
              >
                {peer.name}
              </div>
            ))}
            {exercisePeers.length === 0 && (
              <p className="text-xs text-slate-600 italic">No other peers on this exercise yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}