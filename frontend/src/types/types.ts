export interface Project {
  id: number;
  name: string;
  description?: string;
  owner: {
    username: string;
  } | null;
}
