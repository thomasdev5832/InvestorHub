import { DexPayload } from "./dexpayload";
import { MintParams } from "./mintparams";

export interface StartSwapParams {
    totalAmountIn: string;
    payload: DexPayload;
    stakePayload: MintParams;
  }