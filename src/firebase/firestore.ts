import {
    collection,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    increment,
    onSnapshot,
    query,
    orderBy
  } from "firebase/firestore";
import { db } from "./config";
  
interface Option {
  id: string;
  text: string;
  votes: number;
}
  
const pollOptionsCollection = collection(db, "polls", "global", "options");
  
// Fetch options from Firestore with real-time updates
export function subscribeToPollOptions(callback: (options: Option[]) => void) {
  const q = query(pollOptionsCollection, orderBy("votes", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const options: Option[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      options.push({
        id: docSnap.id,
        text: data.text,
        votes: data.votes || 0,
      });
    });
    callback(options);
  });
}
  
// Submit vote: increment votes for selected options and mark user voted
export async function submitVote(
  userId: string,
  selectedOptionIds: string[]
): Promise<void> {
  // Check if user already voted
  const voterDocRef = doc(db, "polls", "global", "voters", userId);
  const voterSnap = await getDoc(voterDocRef);
  if (voterSnap.exists()) {
    throw new Error("You have already voted.");
  }

  // Update votes atomically for each selected option
  for (const optionId of selectedOptionIds) {
    const optionDocRef = doc(db, "polls", "global", "options", optionId);
    await updateDoc(optionDocRef, {
      votes: increment(1)
    });
  }

  // Mark user voted
  await setDoc(voterDocRef, { voted: true });
}
  