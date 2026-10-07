import { describe, it, expect } from "vitest";
import { getImageUrl } from "@/helpers/imageUrl";

describe("getImageUrl", () => {
  it("mengembalikan undefined untuk nilai kosong", () => {
    expect(getImageUrl()).toBeUndefined();
    expect(getImageUrl(null)).toBeUndefined();
    expect(getImageUrl("")).toBeUndefined();
  });

  it("memakai URL lengkap dan data URI apa adanya", () => {
    expect(getImageUrl("https://a.com/x.png")).toBe("https://a.com/x.png");
    expect(getImageUrl("http://a.com/x.png")).toBe("http://a.com/x.png");
    expect(getImageUrl("//cdn.com/x.png")).toBe("//cdn.com/x.png");
    expect(getImageUrl("data:image/png;base64,AAA")).toBe("data:image/png;base64,AAA");
  });

  it("menggabungkan path relatif dengan base URL", () => {
    expect(getImageUrl("uploads/a.png")).toBe("https://open-api.delcom.org/uploads/a.png");
    expect(getImageUrl("/uploads/a.png")).toBe("https://open-api.delcom.org/uploads/a.png");
  });
});