'use client';

import { use, useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { Lobby } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Shuffle, CheckCircle2 } from 'lucide-react';

export default function InstructorPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/join/${code}`);
    }

    const socket = getSocket();
    socket.emit('join_lobby_channel', { code });

    socket.on('lobby_state', (updatedLobby: Lobby) => setLobby(updatedLobby));
    socket.on('groups_formed', (updatedLobby: Lobby) => setLobby(updatedLobby));

    return () => {
      socket.off('lobby_state');
      socket.off('groups_formed');
    };
  }, [code]);

  const handleGroupUp = () => {
    const socket = getSocket();
    socket.emit('trigger_grouping', { code });
  };

  if (!lobby) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Connecting to session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
        <div>
          <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
            Instructor Control Hub
          </span>
          <h1 className="text-3xl font-black font-mono">ROOM: {code}</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-300 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
            <Users className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold">{lobby.students.length}</span> Students
          </div>
          {lobby.status === 'WAITING' ? (
            <button
              onClick={handleGroupUp}
              disabled={lobby.students.length === 0}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Shuffle className="w-4 h-4" /> Group Up Students
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-4 py-2 rounded-lg font-semibold">
              <CheckCircle2 className="w-5 h-5" /> Matrix Groups Active
            </div>
          )}
        </div>
      </header>

      {lobby.status === 'WAITING' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="bg-white p-4 rounded-xl mb-4 shadow-md">
              {joinUrl && <QRCodeSVG value={joinUrl} size={180} />}
            </div>
            <p className="text-sm font-semibold text-slate-300">Scan to Join</p>
            <p className="text-xs font-mono text-slate-500 mt-1 break-all">{joinUrl}</p>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: lobby.exerciseCount }, (_, i) => i + 1).map((exId) => {
              const studentsInExercise = lobby.students.filter((s) => s.exerciseId === exId);
              return (
                <div
                  key={exId}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-200">Exercise {exId}</h3>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                      {studentsInExercise.length}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1.5 overflow-y-auto max-h-48">
                    {studentsInExercise.map((student) => (
                      <div
                        key={student.id}
                        className="text-xs bg-slate-950 border border-slate-800/80 px-2.5 py-1.5 rounded text-slate-300 truncate"
                      >
                        {student.name}
                      </div>
                    ))}
                    {studentsInExercise.length === 0 && (
                      <p className="text-xs text-slate-600 italic">No students yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lobby.groups.map((group) => (
            <div
              key={group.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-lg text-emerald-400 mb-3">{group.name}</h3>
                <div className="space-y-2">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-200">{member.name}</span>
                      <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                        Ex {member.exerciseId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}