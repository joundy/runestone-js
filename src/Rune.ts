import { U128 } from "big-varuint-js";

export class Rune {
  readonly rune: U128;

  constructor(rune: U128) {
    this.rune = rune;
  }

  static fromString(str: string) {
    let number = 0n;

    for (let i = 0; i < str.length; i += 1) {
      const c = str.charAt(i);
      if (i > 0) {
        number += 1n;
      }
      number *= 26n;
      if (c >= "A" && c <= "Z") {
        number += BigInt(c.charCodeAt(0) - "A".charCodeAt(0));
      } else {
        throw new Error(`Invalid character in rune name: ${c}`);
      }
    }

    return new Rune(new U128(number));
  }

  commitBuffer() {
    let number = this.rune.toValue();
    const arr = [];
    while (number >> 8n > 0) {
      arr.push(Number(number & 0b11111111n));
      number >>= 8n;
    }
    arr.push(Number(number));

    return Buffer.from(arr);
  }

  toString() {
    let n = this.rune.toValue();

    n += 1n;
    let str = "";
    while (n > 0n) {
      str += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Number((n - 1n) % 26n)];
      n = (n - 1n) / 26n;
    }

    return str.split("").reverse().join("");
  }

  toJSON() {
    return this.toString();
  }
}
