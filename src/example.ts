import { U128, U32, U64, U8 } from "big-varuint-js";
import Runestone from "./Runestone";
import { RuneId } from "./RuneId";

function main() {
  const runestone = new Runestone({
    edicts: [
      {
        id: new RuneId(new U64(10n), new U32(1n)),
        amount: new U128(23n),
        output: new U32(23n),
      },
      {
        id: new RuneId(new U64(10n), new U32(1n)),
        amount: new U128(1111n),
        output: new U32(2222n),
      },
      {
        id: new RuneId(new U64(12n), new U32(28923n)),
        amount: new U128(1111n),
        output: new U32(2222n),
      },
      {
        id: new RuneId(new U64(12398n), new U32(234n)),
        amount: new U128(1111n),
        output: new U32(2222n),
      },
      {
        id: new RuneId(new U64(12n), new U32(1282n)),
        amount: new U128(1111n),
        output: new U32(2222n),
      },
      {
        id: new RuneId(new U64(12n), new U32(4584983n)),
        amount: new U128(1111n),
        output: new U32(2222n),
      },
    ],
    mint: new RuneId(new U64(232390482390843242n), new U32(19823742n)),
    pointer: new U32(1212342342n),
    etching: {
      rune: new U128(232390482390843242n),
      premine: new U128(232390482390843242n),
      spacers: new U32(143n),
      symbol: new U8(1n),
      terms: {
        amount: new U128(232323232323232390482390843242n),
        cap: new U128(532390482390843242n),
        height: {
          start: new U64(1n),
          end: new U64(1n),
        },
        offset: {
          start: new U64(2n),
          end: new U64(2n),
        },
      },
    },
  });

  const buffer = runestone.enchiper();
  console.log(buffer);

  const decodedRune = Runestone.dechiper(buffer);
  const dBuffer = decodedRune.enchiper();
  console.log(dBuffer);
}

main();
