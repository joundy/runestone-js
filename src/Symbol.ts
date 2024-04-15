import { U8 } from "big-varuint-js";

export class Symbol {
  readonly symbol: U8;

  constructor(symbol: U8) {
    this.symbol = symbol;
  }

  static fromString(symbolStr: string) {
    if (symbolStr.length !== 1) {
      throw new Error("Symbol must be 1 character");
    }

    return new Symbol(new U8(BigInt(Buffer.from(symbolStr, "utf8")[0])));
  }

  toString() {
    return Buffer.from([Number(this.symbol.toValue())]).toString("utf8");
  }

  toJSON() {
    return this.toString();
  }
}
