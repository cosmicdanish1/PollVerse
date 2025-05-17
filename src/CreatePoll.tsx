import { useState } from "react";
import {
  collection,
  setDoc,
  getDocs,
  doc
} from "firebase/firestore";
import { db } from "./firebase/config";
import { v4 as uuidv4 } from "uuid";

export default function CreatePoll({ onCreated }: { onCreated: () => void }) {
  const [inputs, setInputs] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (i: number, val: string) => {
    const newInputs = [...inputs];
    newInputs[i] = val;
    setInputs(newInputs);
  };

  const addInput = () => {
    if (inputs.length < 3) setInputs([...inputs, ""]);
  };

  const removeInput = (index: number) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  const createPoll = async () => {
    const validOptions = inputs.map(o => o.trim()).filter(Boolean);
    if (validOptions.length < 1) {
      setError("Add at least one valid option");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const optionsRef = collection(db, "polls", "global", "options");
      const existing = await getDocs(optionsRef);
      const existingOptions = existing.docs.map(doc => doc.data().text.toLowerCase());

      let addedAny = false;
      for (const text of validOptions) {
        if (!existingOptions.includes(text.toLowerCase())) {
          const id = uuidv4();
          await setDoc(doc(optionsRef, id), {
            text,
            votes: 0,
            createdAt: Date.now(),
          });
          addedAny = true;
        }
      }

      if (!addedAny) {
        setError("All options already exist in the poll");
        setLoading(false);
        return;
      }

      // Reset form and close modal
      setInputs([""]);
      setError("");
      onCreated();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-gray-800">➕ Add Options to Poll</h2>

      {inputs.map((val, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
          {inputs.length > 1 && (
            <button
              onClick={() => removeInput(i)}
              className="text-red-500 text-xl hover:text-red-600 transition-colors duration-200"
              title="Remove option"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {inputs.length < 3 && (
        <button
          onClick={addInput}
          className="w-full border-2 border-dashed border-indigo-400 py-3 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all duration-200 font-medium"
        >
          ➕ Add Option
        </button>
      )}

      {error && (
        <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
          {error}
        </p>
      )}

      <button
        disabled={loading}
        onClick={createPoll}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Submit"}
      </button>
    </div>
  );
}
