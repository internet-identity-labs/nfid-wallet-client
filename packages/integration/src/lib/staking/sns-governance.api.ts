import {logWithTimestamp} from "./util/dev.utils";
import {AnonymousIdentity, Identity, SignIdentity} from "@dfinity/agent";
import {IcrcAccount} from "@dfinity/ledger-icrc";
import {Principal} from "@dfinity/principal";
import {
  SnsListProposalsParams,
  SnsNervousSystemParameters,
  SnsNeuron,
  SnsNeuronId,
  SnsNeuronPermissionType,
  SnsProposalId,
  SnsVote,
} from "@dfinity/sns";
import {fromNullable} from "@dfinity/utils";
import {loadSnsWrapper} from "./sns-wrapper.api";

export const querySnsNeurons = async ({
                                        identity,
                                        rootCanisterId,
                                        certified,
                                      }: {
  identity: Principal;
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<SnsNeuron[]> => {
  logWithTimestamp("Getting sns neurons: call...");
  const {listNeurons} = (await loadSnsWrapper({
    identity: new AnonymousIdentity(),
    rootCanisterId: rootCanisterId,
    certified,
  }));
  const neurons = await listNeurons({
    principal: identity,
  });

  logWithTimestamp("Getting sns neurons: done");
  return neurons;
};

/**
 * Returns the neuron or raises an error if not found.
 */
export const getSnsNeuron = async ({
                                     identity,
                                     rootCanisterId,
                                     certified,
                                     neuronId,
                                   }: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
  neuronId: SnsNeuronId;
}): Promise<SnsNeuron> => {
  logWithTimestamp("Getting sns neuron: call...");
  const {getNeuron} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified,
  });
  const neuron = await getNeuron({
    neuronId,
  });

  logWithTimestamp("Getting sns neuron: done");
  return neuron;
};

/**
 * Returns the neuron or undefined.
 */
export const querySnsNeuron = async ({
                                       identity,
                                       rootCanisterId,
                                       certified,
                                       neuronId,
                                     }: {
  identity: Identity;
  rootCanisterId: Principal;
  certified: boolean;
  neuronId: SnsNeuronId;
}): Promise<SnsNeuron | undefined> => {
  logWithTimestamp("Querying sns neuron: call...");
  const {queryNeuron} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified,
  });
  const neuron = await queryNeuron({
    neuronId,
  });

  logWithTimestamp("Getting sns neuron: done");
  return neuron;
};

export const addNeuronPermissions = async ({
                                             identity,
                                             rootCanisterId,
                                             permissions,
                                             principal,
                                             neuronId,
                                           }: {
  identity: Identity;
  rootCanisterId: Principal;
  permissions: SnsNeuronPermissionType[];
  principal: Principal;
  neuronId: SnsNeuronId;
}): Promise<void> => {
  logWithTimestamp("Adding neuron permissions: call...");
  const {addNeuronPermissions} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });
  await addNeuronPermissions({
    permissions,
    principal,
    neuronId,
  });

  logWithTimestamp("Adding neuron permissions: done");
};

export const removeNeuronPermissions = async ({
                                                identity,
                                                rootCanisterId,
                                                permissions,
                                                principal,
                                                neuronId,
                                              }: {
  identity: Identity;
  rootCanisterId: Principal;
  permissions: SnsNeuronPermissionType[];
  principal: Principal;
  neuronId: SnsNeuronId;
}): Promise<void> => {
  logWithTimestamp("Removing neuron permissions: call...");
  const {removeNeuronPermissions} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });
  await removeNeuronPermissions({
    permissions,
    principal,
    neuronId,
  });

  logWithTimestamp("Removing neuron permissions: done");
};

export const disburse = async ({
                                 identity,
                                 rootCanisterId,
                                 neuronId,
                               }: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
}): Promise<void> => {
  logWithTimestamp(`Disburse sns neuron call...`);

  const {disburse} = await loadSnsWrapper({
    identity,
    rootCanisterId: rootCanisterId,
    certified: true,
  });

  await disburse({
    neuronId,
  });

  logWithTimestamp(`Disburse sns neuron complete.`);
};

export const splitNeuron = async ({
                                    identity,
                                    rootCanisterId,
                                    neuronId,
                                    amount,
                                    memo,
                                  }: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
  amount: bigint;
  memo: bigint;
}): Promise<void> => {
  logWithTimestamp(`Split sns neuron call...`);

  const {splitNeuron} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });

  await splitNeuron({
    neuronId,
    amount,
    memo,
  });

  logWithTimestamp(`Split sns neuron complete.`);
};

export const startDissolving = async ({
                                        identity,
                                        rootCanisterId,
                                        neuronId,
                                      }: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
}): Promise<void> => {
  logWithTimestamp(`Start dissolving sns neuron call...`);

  const {startDissolving} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });

  await startDissolving(neuronId);

  logWithTimestamp(`Start dissolving sns neuron complete.`);
};

export const stopDissolving = async ({
                                       identity,
                                       rootCanisterId,
                                       neuronId,
                                     }: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
}): Promise<void> => {
  logWithTimestamp(`Stop dissolving sns neuron call...`);

  const {stopDissolving} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });

  await stopDissolving(neuronId);

  logWithTimestamp(`Stop dissolving sns neuron complete.`);
};

export const increaseDissolveDelay = async ({
                                              identity,
                                              rootCanisterId,
                                              neuronId,
                                              additionalDissolveDelaySeconds,
                                            }: {
  identity: Identity;
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
  additionalDissolveDelaySeconds: number;
}): Promise<void> => {
  logWithTimestamp(`Increase sns dissolve delay call...`);

  const {increaseDissolveDelay} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });
  await increaseDissolveDelay({
    neuronId,
    additionalDissolveDelaySeconds: additionalDissolveDelaySeconds,
  });

  logWithTimestamp(`Increase sns dissolve delay complete.`);
};

export const getNeuronBalance = async ({
                                         neuronId,
                                         rootCanisterId,
                                         certified,
                                         identity,
                                       }: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  certified: boolean;
  identity: Identity;
}): Promise<bigint> => {
  logWithTimestamp(
    `Getting neuron ${subaccountToHexString(neuronId.id)} balance call...`
  );

  const {getNeuronBalance: getNeuronBalanceApi} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified,
  });

  const balance = await getNeuronBalanceApi(neuronId);

  logWithTimestamp(
    `Getting neuron ${subaccountToHexString(
      neuronId.id
    )} balance call complete.`
  );
  return balance;
};

export const refreshNeuron = async ({
                                      rootCanisterId,
                                      identity,
                                      neuronId,
                                    }: {
  rootCanisterId: Principal;
  identity: Identity;
  neuronId: SnsNeuronId;
}): Promise<void> => {
  logWithTimestamp(
    `Refreshing neuron ${subaccountToHexString(neuronId.id)} call...`
  );

  const {refreshNeuron: refreshNeuronApi} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });

  await refreshNeuronApi(neuronId);

  logWithTimestamp(
    `Refreshing neuron ${subaccountToHexString(neuronId.id)} call complete.`
  );
};

export const claimNeuron = async ({
                                    rootCanisterId,
                                    identity,
                                    memo,
                                    controller,
                                    subaccount,
                                  }: {
  rootCanisterId: Principal;
  identity: Identity;
  memo: bigint;
  controller: Principal;
  subaccount: Uint8Array | number[];
}): Promise<SnsNeuronId> => {
  logWithTimestamp(`Claiming neuron call...`);

  const {claimNeuron: claimNeuronApi} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });

  const neuronId = await claimNeuronApi({
    subaccount,
    memo,
    controller,
  });

  logWithTimestamp(`Claiming neuron call complete.`);
  return neuronId;
};

export const nervousSystemParameters = async ({
                                                rootCanisterId,
                                                identity,
                                                certified,
                                              }: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<SnsNervousSystemParameters> => {
  logWithTimestamp(`Querying nervous system parameters...`);

  const {nervousSystemParameters: nervousSystemParametersApi} = await loadSnsWrapper(
    {
      identity,
      rootCanisterId,
      certified,
    }
  );

  const parameters = await nervousSystemParametersApi({});

  logWithTimestamp(`Querying nervous system parameters complete.`);
  return parameters;
};

export const setFollowees = async ({
                                     rootCanisterId,
                                     identity,
                                     neuronId,
                                     functionId,
                                     followees,
                                   }: {
  rootCanisterId: Principal;
  identity: Identity;
  neuronId: SnsNeuronId;
  functionId: bigint;
  followees: SnsNeuronId[];
}): Promise<void> => {
  logWithTimestamp(`Setting sns neuron followee call...`);

  const {setTopicFollowees} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });

  await setTopicFollowees({
    neuronId,
    functionId,
    followees,
  });

  logWithTimestamp(`Setting sns neuron followee call complete.`);
};

export const stakeMaturity = async ({
                                      neuronId,
                                      rootCanisterId,
                                      identity,
                                      percentageToStake,
                                    }: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  identity: Identity;
  percentageToStake: number;
}): Promise<void> => {
  logWithTimestamp(`Stake maturity: call...`);

  const {stakeMaturity: stakeMaturityApi} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });

  await stakeMaturityApi({
    neuronId,
    percentageToStake,
  });

  logWithTimestamp(`Stake maturity: complete`);
};

export const disburseMaturity = async ({
                                         neuronId,
                                         rootCanisterId,
                                         identity,
                                         percentageToDisburse,
                                         toAccount,
                                       }: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  identity: Identity;
  percentageToDisburse: number;
  toAccount?: IcrcAccount;
}): Promise<void> => {
  logWithTimestamp(`Disburse maturity: call...`);

  const {disburseMaturity: percentageToDisburseApi} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });

  await percentageToDisburseApi({
    neuronId,
    percentageToDisburse,
    toAccount,
  });

  logWithTimestamp(`Disburse maturity: complete`);
};

export const registerVote = async ({
                                     neuronId,
                                     rootCanisterId,
                                     identity,
                                     proposalId,
                                     vote,
                                   }: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  identity: Identity;
  proposalId: SnsProposalId;
  vote: SnsVote;
}): Promise<void> => {
  logWithTimestamp(`Register vote: call...`);

  const {registerVote: registerVoteApi} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });

  await registerVoteApi({
    neuronId,
    proposalId,
    vote,
  });

  logWithTimestamp(`Register vote: complete`);
};

export const autoStakeMaturity = async ({
                                          neuronId,
                                          rootCanisterId,
                                          identity,
                                          autoStake,
                                        }: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  identity: Identity;
  autoStake: boolean;
}): Promise<void> => {
  logWithTimestamp(
    `${autoStake ? "Enable" : "Disable"} auto stake maturity call...`
  );

  const {autoStakeMaturity: autoStakeMaturityApi} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified: true,
  });

  await autoStakeMaturityApi({
    neuronId,
    autoStake,
  });

  logWithTimestamp(
    `${autoStake ? "Enable" : "Disable"} auto stake maturity complete.`
  );
};

export const queryProposals = async ({
                                       rootCanisterId,
                                       identity,
                                       certified,
                                       params,
                                     }: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
  params: SnsListProposalsParams;
}) => {
  logWithTimestamp(`Getting proposals call...`);

  const {listProposals} = await loadSnsWrapper({
    identity,
    rootCanisterId,
    certified,
  });

  const response = await listProposals(params);

  logWithTimestamp(`Getting proposals call complete.`);
  return response;
};

export const queryProposal = async ({
                                      rootCanisterId,
                                      identity,
                                      certified,
                                      proposalId,
                                    }: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
  proposalId: SnsProposalId;
}) => {
  try {
    logWithTimestamp(`Getting proposal ${proposalId.id} call...`);

    const {getProposal} = await loadSnsWrapper({
      identity,
      rootCanisterId,
      certified,
    });

    return getProposal({proposalId});
  } finally {
    logWithTimestamp(`Getting proposal ${proposalId.id} call complete.`);
  }
};

// Type for ANY call
type ApiCallParams = {
  identity: Identity
  canisterId: Principal
}

export type ApiStakeNeuronIcrc1Params = ApiCallParams & {
  stake: bigint
  controller: Principal
  ledgerCanisterIdentity: Identity
  fromSubAccount?: Uint8Array
}

/**
 * Uses governance and ledger canisters to create a neuron
 */
export const stakeNeuron = async ({
                                    identity,
                                    canisterId,
                                    stake
                                  }: {
  identity: SignIdentity,
  canisterId: Principal,
  stake: bigint
}): Promise<{
  id: Uint8Array | number[];
}> => {
  logWithTimestamp(`Staking Neuron call...`);
  let wrapper = await loadSnsWrapper({identity, rootCanisterId: canisterId, certified: true})
  logWithTimestamp(`Staking Neuron complete.`);
  return wrapper.stakeNeuron({
    stakeE8s: stake,
    source: {
      owner: identity.getPrincipal(),
    },
    controller: identity.getPrincipal()
  });
};



// Convert a byte array to a hex string
export const bytesToHexString = (bytes: number[]): string =>
  bytes.reduce(
    (str, byte) => `${str}${byte.toString(16).padStart(2, "0")}`,
    ""
  );

export const subaccountToHexString = (
  subaccount: Uint8Array | number[]
): string => bytesToHexString(Array.from(subaccount));

export const getSnsNeuronIdAsHexString = ({
                                            id: neuronId,
                                          }: SnsNeuron): string =>
  subaccountToHexString(fromNullable(neuronId)?.id ?? new Uint8Array());
