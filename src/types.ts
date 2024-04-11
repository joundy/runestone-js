import { U128, U32, U64, U8 } from "big-varuint-js";
import { RuneId } from "./RuneId";
import { Rune } from "./Rune";

export type Edict = {
  id: RuneId;
  amount: U128;
  output: U32;
};

export type Terms = {
  amount?: U128;
  cap?: U128;
  height?: {
    start?: U64;
    end?: U64;
  };
  offset?: {
    start?: U64;
    end?: U64;
  };
};

export type Etching = {
  divisibility?: U8;
  premine?: U128;
  rune?: Rune;
  spacers?: U32;
  symbol?: U8;
  terms?: Terms;
};

export type RunestoneParams = {
  edicts: Edict[];
  etching?: Etching;
  mint?: RuneId;
  pointer?: U32;
};
