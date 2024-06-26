import {
  getChainByChainIdAsync,
  getChainBySlugAsync,
} from "@thirdweb-dev/chains";
import { getChainIdFromChain } from "../server/utils/chain";
import { getConfig } from "../utils/cache/getConfig";

// Mock the external dependencies
jest.mock("../utils/cache/getConfig");
jest.mock("@thirdweb-dev/chains");

const mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>;

const mockGetChainByChainIdAsync =
  getChainByChainIdAsync as jest.MockedFunction<typeof getChainByChainIdAsync>;
const mockGetChainBySlugAsync = getChainBySlugAsync as jest.MockedFunction<
  typeof getChainBySlugAsync
>;

describe("getChainIdFromChain", () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  it("should return the chainId from chainOverrides if it exists by slug", async () => {
    // @ts-ignore
    mockGetConfig.mockResolvedValueOnce({
      chainOverrides: JSON.stringify([
        {
          slug: "Polygon",
          chainId: 137,
        },
      ]),
    });

    const result = await getChainIdFromChain("Polygon");

    expect(result).toBe(137);
    expect(getChainByChainIdAsync).not.toHaveBeenCalled();
    expect(getChainBySlugAsync).not.toHaveBeenCalled();
  });

  it("should return the chainId from chainOverrides if it exists by slug, case-insensitive", async () => {
    // @ts-ignore
    mockGetConfig.mockResolvedValueOnce({
      chainOverrides: JSON.stringify([
        {
          slug: "Polygon",
          chainId: 137,
        },
      ]),
    });

    const result = await getChainIdFromChain("polygon");

    expect(result).toBe(137);
    expect(getChainByChainIdAsync).not.toHaveBeenCalled();
    expect(getChainBySlugAsync).not.toHaveBeenCalled();
  });

  it("should return the chainId from chainOverrides if it exists by ID", async () => {
    // @ts-ignore
    mockGetConfig.mockResolvedValueOnce({
      chainOverrides: JSON.stringify([
        {
          slug: "Polygon",
          chainId: 137,
        },
      ]),
    });

    const result = await getChainIdFromChain("137");

    expect(result).toBe(137);
    expect(getChainByChainIdAsync).not.toHaveBeenCalled();
    expect(getChainBySlugAsync).not.toHaveBeenCalled();
  });

  it("should return the chainId from chainOverrides if it exists", async () => {
    // @ts-ignore
    mockGetConfig.mockResolvedValueOnce({
      chainOverrides: JSON.stringify([
        {
          slug: "Polygon",
          chainId: 137,
        },
      ]),
    });

    const result = await getChainIdFromChain("Polygon");

    expect(result).toBe(137);
    expect(getChainByChainIdAsync).not.toHaveBeenCalled();
    expect(getChainBySlugAsync).not.toHaveBeenCalled();
  });

  it("should return the chainId from getChainByChainIdAsync if chain is a valid numeric string", async () => {
    // @ts-ignore
    mockGetConfig.mockResolvedValueOnce({});
    // @ts-ignore
    mockGetChainByChainIdAsync.mockResolvedValueOnce({
      name: "Polygon",
      chainId: 137,
    });

    const result = await getChainIdFromChain("137");

    expect(result).toBe(137);
    expect(getChainByChainIdAsync).toHaveBeenCalledWith(137);
    expect(getChainBySlugAsync).not.toHaveBeenCalled();
  });

  it("should return the chainId from getChainBySlugAsync if chain is a valid string", async () => {
    // @ts-ignore
    mockGetConfig.mockResolvedValueOnce({});
    // @ts-ignore
    mockGetChainBySlugAsync.mockResolvedValueOnce({
      name: "Polygon",
      chainId: 137,
    });

    const result = await getChainIdFromChain("Polygon");

    expect(result).toBe(137);
    expect(getChainBySlugAsync).toHaveBeenCalledWith("polygon");
    expect(getChainByChainIdAsync).not.toHaveBeenCalled();
  });

  it("should throw an error for an invalid chain", async () => {
    // @ts-ignore
    mockGetConfig.mockResolvedValueOnce({});

    await expect(getChainIdFromChain("6666666666666")).rejects.toThrow(
      "Invalid or deprecated chain. Please confirm this is a valid chain: https://thirdweb.com/6666666666666",
    );
  });
});
