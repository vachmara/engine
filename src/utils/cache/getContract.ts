import { SmartContract, ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ContractInterface } from "ethers";
import { StatusCodes } from "http-status-codes";
import { createCustomError } from "../../server/middleware/error";
import { getSdk } from "./getSdk";

interface GetContractParams {
  chainId: number;
  walletAddress?: string;
  accountAddress?: string;
  contractAddress: string;
}

interface GetInterfaceParams {
  sdk: ThirdwebSDK;
  contractAddress: string;
}

export const getContract = async ({
  chainId,
  walletAddress,
  contractAddress,
  accountAddress,
}: GetContractParams): Promise<SmartContract> => {
  const sdk = await getSdk({ chainId, walletAddress, accountAddress });

  try {
    // SDK already handles caching.
    const contract = await sdk.getContract(contractAddress);

    const implementationAbi = await getImplementation({ sdk, contractAddress });

    if (implementationAbi) {
      // Return a new contract instance with the proxy address and implementation ABI
      return await sdk.getContractFromAbi(contractAddress, implementationAbi);
    }

    return contract;
  } catch (e) {
    throw createCustomError(
      `Contract metadata could not be resolved: ${e}`,
      StatusCodes.BAD_REQUEST,
      "INVALID_CONTRACT",
    );
  }
};

async function getImplementation({
  sdk,
  contractAddress,
}: GetInterfaceParams): Promise<ContractInterface | null> {
  try {
    // Check for the implementation address slot
    const implementationSlot =
      "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

    const provider = sdk.getProvider();
    const implementationAddress = await provider.getStorageAt(
      contractAddress,
      implementationSlot,
    );

    // Convert the implementation address Bytes32 to a valid address string
    const implementationAddressString = `0x${implementationAddress.slice(26)}`;

    if (implementationAddress && parseInt(implementationAddress, 16) !== 0) {
      const implementationContract = await sdk.getContract(
        implementationAddressString,
      );

      return implementationContract.abi;
    }

    return null;
  } catch (error) {
    console.error("Error fetching implementation address:", error);
    return null;
  }
}
