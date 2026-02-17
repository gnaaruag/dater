export interface Dater {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  color: string; // hex
  recurring: boolean;
  intervalValue?: number;
  intervalUnit?: "days" | "weeks" | "months" | "years";
  anchorDay: boolean; // "anchor day" — repeats around one day each month
  anchorDayValue?: number; // positive = nth day, negative = nth-from-last
  createdAt: string;
}

export interface Note {
  id: string;
  daterId: string;
  text: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}
