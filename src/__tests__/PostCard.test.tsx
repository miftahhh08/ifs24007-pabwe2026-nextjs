import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PostCard from "@/features/posts/components/PostCard";
import { Post } from "@/types";

const mockPost: Post = {
  id: "1",
  title: "Judul Post Testing",
  content: "Ini adalah konten postingan untuk unit test Vitest.",
  user_id: "100",
  created_at: new Date().toISOString(),
  user: {
    id: "100",
    name: "Penguji Kode",
    email: "tester@delcom.org",
  },
};

describe("Komponen PostCard Unit Testing", () => {
  it("menampilkan judul dan nama pembuat post dengan benar", () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText("Judul Post Testing")).toBeDefined();
    expect(screen.getByText("Oleh: Penguji Kode")).toBeDefined();
  });
});