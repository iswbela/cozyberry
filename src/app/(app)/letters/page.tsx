import { getLetters } from "@/actions/letters";
import { LettersView } from "@/components/letters/letters-view";

export default async function LettersPage() {
  const letters = await getLetters();
  const now = new Date();
  const lettersWithStatus = letters.map((l) => ({
    ...l,
    isUnlocked: new Date(l.unlockDate) <= now,
  }));
  return <LettersView initialLetters={lettersWithStatus} />;
}
