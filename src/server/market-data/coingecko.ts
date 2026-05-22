export type CoinMetadata = {
  id: string;
  imageUrl: string | null;
  marketCapUsd: number | null;
  name: string;
  provider: "coingecko";
  symbol: string;
};

type CoinGeckoMarketRow = {
  id: string;
  image: string | null;
  market_cap: number | null;
  name: string;
  symbol: string;
};

const COINGECKO_REST_BASE_URL = "https://api.coingecko.com/api/v3";
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  ADA: "cardano",
  AVAX: "avalanche-2",
  BNB: "binancecoin",
  BTC: "bitcoin",
  DOGE: "dogecoin",
  DOT: "polkadot",
  ETH: "ethereum",
  LINK: "chainlink",
  MATIC: "matic-network",
  SOL: "solana",
  TRX: "tron",
  XRP: "ripple",
};

export async function getCoinMetadataForPairs(symbols: readonly string[]) {
  const coinIds = Array.from(
    new Set(
      symbols
        .map((symbol) => SYMBOL_TO_COINGECKO_ID[getBaseAsset(symbol)])
        .filter((id): id is string => Boolean(id)),
    ),
  );

  if (coinIds.length === 0) {
    return new Map<string, CoinMetadata>();
  }

  try {
    const params = new URLSearchParams({
      ids: coinIds.join(","),
      order: "market_cap_desc",
      per_page: String(coinIds.length),
      price_change_percentage: "24h",
      sparkline: "false",
      vs_currency: "usd",
    });
    const response = await fetch(`${COINGECKO_REST_BASE_URL}/coins/markets?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return new Map<string, CoinMetadata>();
    }

    const rows = await response.json() as CoinGeckoMarketRow[];
    const metadataByBaseAsset = new Map(
      rows.map((row) => [
        row.symbol.toUpperCase(),
        {
          id: row.id,
          imageUrl: row.image,
          marketCapUsd: row.market_cap,
          name: row.name,
          provider: "coingecko" as const,
          symbol: row.symbol.toUpperCase(),
        },
      ]),
    );

    return new Map(
      symbols
        .map((symbol) => {
          const metadata = metadataByBaseAsset.get(getBaseAsset(symbol));

          return metadata ? [symbol, metadata] as const : null;
        })
        .filter((entry): entry is readonly [string, CoinMetadata] => entry !== null),
    );
  } catch {
    return new Map<string, CoinMetadata>();
  }
}

function getBaseAsset(symbol: string) {
  return symbol.split("/")[0]?.toUpperCase() ?? symbol.toUpperCase();
}
