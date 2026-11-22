import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "@/mocks/server";
import { HttpError } from "../error/custom/http-error";
import { NetworkError } from "../error/custom/network-error";
import { fetchData } from "./fetch-data";

vi.mock("@/lib/pino/logger", () => ({
  logger: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
}));

const url = "http://backend.test/tasks";

describe("fetchData", () => {
  it("returns the JSON body as data for a 200 response", async () => {
    server.use(http.get(url, () => HttpResponse.json({ id: 1 })));

    const result = await fetchData(url, { method: "GET" });

    expect(result).not.toBeInstanceOf(Error);
    expect(result).toMatchObject({ data: { id: 1 } });
  });

  it("returns null as data for a 204 response", async () => {
    server.use(http.get(url, () => new HttpResponse(null, { status: 204 })));

    const result = await fetchData(url, { method: "GET" });

    expect(result).toMatchObject({ data: null });
  });

  it("returns an HttpError for a 404 response", async () => {
    server.use(
      http.get(url, () =>
        HttpResponse.json({ error: "not found" }, { status: 404 }),
      ),
    );

    const result = await fetchData(url, { method: "GET" });

    expect(result).toBeInstanceOf(HttpError);
    expect(result).toMatchObject({ statusCode: 404 });
  });

  it("returns a NetworkError when the request fails", async () => {
    server.use(http.get(url, () => HttpResponse.error()));

    const result = await fetchData(url, { method: "GET" });

    expect(result).toBeInstanceOf(NetworkError);
  });
});
