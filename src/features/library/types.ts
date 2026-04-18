export type LibraryItemType = "BOOK" | "ARTICLE" | "VIDEO" | "COURSE" | "OTHER";
export type LibraryItemStatus = "WANT_TO_READ" | "READING" | "COMPLETED" | "DROPPED";

export interface LibraryItemData {
  id:        string;
  title:     string;
  author:    string | null;
  url:       string | null;
  type:      LibraryItemType;
  status:    LibraryItemStatus;
  rating:    number | null;
  notes:     string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertLibraryItemInput {
  id?:     string;
  title:   string;
  author?: string | null;
  url?:    string | null;
  type?:   LibraryItemType;
  status?: LibraryItemStatus;
  rating?: number | null;
  notes?:  string | null;
}
