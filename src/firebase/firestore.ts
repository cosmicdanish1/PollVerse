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

interface VoteResult {
  success: boolean;
  message: string;
  isMalpractice: boolean;
  attemptCount?: number;
}

// Function to get user's IP address
async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    throw new Error('Failed to get IP address');
  }
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
  selectedOptionIds: string[]
): Promise<VoteResult> {
  // Get user's IP address
  const userIP = await getUserIP();
  
  // Check if IP has already voted
  const voterDocRef = doc(db, "polls", "global", "voters", userIP);
  const voterSnap = await getDoc(voterDocRef);
  
  if (voterSnap.exists()) {
    const voterData = voterSnap.data();
    const attemptCount = (voterData.attemptCount || 0) + 1;
    
    // Update attempt count
    await updateDoc(voterDocRef, {
      attemptCount,
      lastAttempt: new Date().toISOString()
    });

    return {
      success: false,
      message: "⚠️ Multiple voting detected! This is considered malpractice.",
      isMalpractice: true,
      attemptCount
    };
  }

  // Update votes atomically for each selected option
  for (const optionId of selectedOptionIds) {
    const optionDocRef = doc(db, "polls", "global", "options", optionId);
    await updateDoc(optionDocRef, {
      votes: increment(1)
    });
  }

  // Mark IP as voted
  await setDoc(voterDocRef, { 
    voted: true,
    votedAt: new Date().toISOString(),
    attemptCount: 1
  });

  return {
    success: true,
    message: "✅ Vote submitted successfully!",
    isMalpractice: false
  };
}
  