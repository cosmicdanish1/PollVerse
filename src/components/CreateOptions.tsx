import { useState } from "react";

export default function CreateOptions({ onSubmit }: { onSubmit: (options: string[]) => void }) {
  const [inputs, setInputs] = useState([""]);

  const handleChange = (i: number, val: string) => {
    const updated = [...inputs];
    updated[i] = val;
    setInputs(updated);
  };

  const addOption = () => {
    if (inputs.length < 3) setInputs([...inputs, ""]);
  };

  const removeOption = (i: number) => {
    setInputs(inputs.filter((_, idx) => idx !== i));
  };

  const handleSubmit = () => {
    const valid = inputs.filter(opt => opt.trim());
    if (valid.length < 1 || valid.length > 3) return alert("Enter 1 to 3 options");
    onSubmit(valid);
  };

  return (
    <div className="space-y-2">
      {inputs.map((val, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={val}
            onChange={e => handleChange(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            className="p-2 border rounded w-full"
          />
          {inputs.length > 1 && (
            <button onClick={() => removeOption(i)} className="text-red-600">✕</button>
          )}
        </div>
      ))}
      {inputs.length < 3 && (
        <button onClick={addOption} className="text-indigo-600">+ Add Option</button>
      )}
      <button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
      >
        Create Poll
      </button>
    </div>
  );
}