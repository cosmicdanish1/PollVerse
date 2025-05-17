import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

interface Option {
  id: string;
  text: string;
  votes: number;
}

export default function ChartPanel() {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(
        collection(db, "polls", "active", "options")
      );
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Option[];
      setOptions(data);
    };
    fetchData();
  }, []);

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);
  const sorted = [...options].sort((a, b) => b.votes - a.votes);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">🏆 Leaderboard</h2>
      {sorted.map((opt, index) => {
        const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
        return (
          <div key={opt.id} className="space-y-1">
            <div className="flex justify-between font-medium">
              <span>
                {index === 0 && "🏆"} {opt.text}
              </span>
              <span>{opt.votes} votes</span>
            </div>
            <div className="w-full bg-gray-200 rounded h-2">
              <div
                className="bg-indigo-500 h-2 rounded"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}