import fetch from 'node-fetch';

type CollectionName = keyof typeof collections;

const collections = {
  'FFF': 'BUjZjAS2vbbb65g7Z1Ca9ZRVYoJscURG5L3AkVvHP9ac',
  'TFF': 'HbPtffcEzzSzZ1VJaTjaAJqTUQpfNeMkPqNG81dWE2Bi',
  'Dens': 'EHk5rVJz4NYRFvddC5hFbceJJjF58TmLEVas27JS77kn',
  'F&F': 'Gwr8Vc3YG7kzj7BG44bXMCUi8N2P7FygcLECDcWySnop',
};

export async function fetchCollectionMetadata(name: CollectionName): Promise<any[]> {
  const endpoint = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
  let page = 1;
  let allMetadata: any[] = [];
  const groupValue = collections[name];

  console.log(`Starting to fetch metadata for groupValue: ${groupValue}`);

  while (true) {
    console.log(`Fetching page ${page} for groupValue: ${groupValue}`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByGroup',
        params: {
          groupKey: 'collection',
          groupValue: groupValue,
          page: page,
          limit: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${name}: ${response.statusText}`);
    }

    const result = await response.json() as any;

    if (!result.result || !result.result.items || (result.result.items as any[]).length === 0) {
      console.log(`No more items found for ${name} on page ${page}. Exiting loop.`);
      break;
    }

    allMetadata = allMetadata.concat(result.result.items);
    page++;
  }

  return allMetadata;
}
