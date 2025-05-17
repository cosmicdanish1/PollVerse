// src/App.tsx
import React, { useEffect, useState } from "react";
import CreatePoll from "./CreatePoll";
import VoteChart from "./VoteChart";
import { subscribeToPollOptions, submitVote } from "./firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  id: string;
  text: string;
  votes: number;
}

type Mode = "vote" | "create";

const getAnonymousUserId = (): string => {
  let id = localStorage.getItem("anonUserId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("anonUserId", id);
  }
  return id;
};

const GitHubIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const InstagramIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
      clipRule="evenodd"
    />
  </svg>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>("vote");
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

  const userId = getAnonymousUserId();

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToPollOptions((data) => {
      setOptions(data);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((opt) => opt !== id));
    } else if (selected.length < 2) {
      setSelected([...selected, id]);
    } else {
      setMessage("You can vote for up to 2 options");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setMessage("Please select at least one option");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (selected.length > 2) {
      setMessage("You can vote for up to 2 options");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      await submitVote(userId, selected);
      setMessage("✅ Vote submitted!");
      setSelected([]);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to submit vote.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleModalClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setMode("vote");
    }
  };

  if (mode === "create") {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleModalClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg"
        >
          <CreatePoll onCreated={() => {
            setMode("vote");
          }} />
          <button
            className="mt-4 text-white hover:text-gray-200 underline block mx-auto transition-colors duration-200"
            onClick={() => setMode("vote")}
          >
            ← Back to Voting
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-800">🗳️ Poll App</h1>
            </div>
            <div className="flex space-x-4">
              <motion.a
                href="https://github.com/cosmicdanish1"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <GitHubIcon />
              </motion.a>
              <motion.a
                href="https://www.instagram.com/thedanishqureshi1/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <InstagramIcon />
              </motion.a>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold text-center mb-8 text-gray-800"
          >
            Collaborative Poll
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Voting panel */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-4 bg-white p-6 rounded-2xl shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-700">Cast Your Vote</h2>
                <span className="text-sm text-gray-500">
                  {selected.length}/2 options selected
                </span>
              </div>
              <AnimatePresence>
                {options.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                      selected.includes(option.id)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => handleSelect(option.id)}
                  >
                    <p className="text-xl font-medium">{option.text}</p>
                    <p className={`text-sm ${selected.includes(option.id) ? 'text-blue-100' : 'text-gray-600'}`}>
                      Votes: {option.votes}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition-colors duration-200 font-medium text-lg shadow-md hover:shadow-lg"
              >
                Submit Vote
              </motion.button>

              {message && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-center mt-4 text-lg font-medium ${
                    message.includes("✅") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode("create")}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium text-lg shadow-md hover:shadow-lg mt-6"
              >
                ➕ Create a New Poll
              </motion.button>
            </motion.div>

            {/* Leaderboard panel */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Leaderboard</h2>
              <div className="space-y-4">
                {options.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{option.text}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{option.votes} votes</span>
                        {index === 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-2xl"
                          >
                            🏆
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(option.votes / (options[0]?.votes || 1)) * 100}%` 
                        }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
