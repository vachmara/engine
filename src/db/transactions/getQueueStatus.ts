import { prisma } from "../client";

interface GetQueueStatusParams {
  walletAddress?: string;
}

export const getQueueStatus = async ({
  walletAddress,
}: GetQueueStatusParams) => {
  const queued = await prisma.transactions.count({
    where: {
      fromAddress: walletAddress?.toLowerCase(),
      sentAt: null,
      errorMessage: null,
      cancelledAt: null,
    },
  });

  const pending = await prisma.transactions.count({
    where: {
      fromAddress: walletAddress?.toLowerCase(),
      sentAt: { not: null },
      minedAt: null,
      errorMessage: null,
      cancelledAt: null,
    },
  });

  return {
    queued,
    pending,
  };
};
