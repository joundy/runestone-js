import { U8 } from "big-varuint-js";

export enum FlagEnum {
  Etching = 0,
  Terms = 1,
  Cenotaph = 127,
}

export default class Flag {
  private flag: U8;

  constructor(value: U8) {
    this.flag = value;
  }

  set(flag: FlagEnum) {
    const mask = 1n << BigInt(flag);
    this.flag = new U8(this.flag.toValue() | mask);
  }

  hasFlag(flag: FlagEnum) {
    const mask = 1n << BigInt(flag);
    return (this.flag.toValue() & mask) !== 0n;
  }

  toValue() {
    return this.flag;
  }
}
