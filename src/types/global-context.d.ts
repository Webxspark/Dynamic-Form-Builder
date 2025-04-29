export interface IGlobalContext {
  user: {
    roll_number?: string | null;
    name?: string | null;
  };

  api: {
    setUser: (roll_number: string | null, name: string | null) => void;
  };
}
