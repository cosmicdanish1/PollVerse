import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase/config";

interface Option {
  id: string;
  text: string;
  votes: number;
}

export default function VotePanel() {
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [votedIds, setVotedIds] = useState<string[]>([]);

  const optionsRef = collection(db, "polls", "global", "options");

  useEffect(() => {
    const unsubscribe = onSnapshot(optionsRef, (snapshot) => {
      const opts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Option[];
      setOptions(opts);
    });

    const voted = JSON.parse(localStorage.getItem("votedOptions") || "[]");
    setVotedIds(voted);

    return () => unsubscribe();
  }, []);

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    } else if (selected.length < 2) {
      setSelected([...selected, id]);
    }
  };

  const handleVote = async () => {
    const newVotes = [];

    for (const id of selected) {
      const optionDoc = doc(db, "polls", "global", "options", id);
      const option = options.find((opt) => opt.id === id);
      if (!option) return;
      await updateDoc(optionDoc, {
        votes: option.votes + 1
      });
      newVotes.push(id);
    }

    const updatedVoted = [...votedIds, ...newVotes];
    localStorage.setItem("votedOptions", JSON.stringify(updatedVoted));
    setVotedIds(updatedVoted);
    setSelected([]);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-2xl font-bold text-center">🗳️ Cast Your Vote</h2>

      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        const isVoted = votedIds.includes(option.id);

        return (
          <button
            key={option.id}
            disabled={isVoted}
            onClick={() => toggleSelect(option.id)}
            className={`w-full p-3 rounded text-left border ${
              isSelected
                ? "bg-indigo-100 border-indigo-400"
                : isVoted
                ? "bg-green-100 border-green-400 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">{option.text}</span>
              <span className="text-sm text-gray-500">{option.votes} votes</span>
            </div>
          </button>
        );
      })}

      {selected.length > 0 && (
        <button
          onClick={handleVote}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          ✅ Submit Vote ({selected.length})
        </button>
      )}
    </div>
  );
}
