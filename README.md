## Bitcoin ordinals runestone JS implementation

This implementation is based on ord 0.17.1, \*use this as a reference only

## Key Features

- enchiper(encode)
- dechiper(decode)

## Example

### enchiper

```
function exampleEncode() {
  const spacedRune = SpacedRune.fromString("RUNESTONE.COIN");

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
    ],
    mint: new RuneId(new U64(232390482390843242n), new U32(19823742n)),
    pointer: new U32(1212342342n),
    etching: {
      rune: spacedRune.rune,
      spacers: spacedRune.spacers,
      premine: new U128(232390482390843242n),
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
  console.log({
    buffer,
    commitBuffer: runestone.etching?.rune?.commitBuffer(),
  });
  // *the script has no "OP_RETURN OP_13 [bytes_length]" preffix, please add it manually if you want to put it inside the tx
  // - hex: 0x6a 0x5d [bytes_length] ...
  // - bitcoinjs-lib: bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, bitcoin.opcodes.OP_13, buffer])
  // output:
  // {
  //   buffer: Buffer(92) [ 2, 3, 4, 219, 230, 200, 158, 172, 179, 226, 247, 24, 3, 128, 2, 6, 234, 254, 217, 192, 153, 189, 231, 156, 3, 5, 1, 10, 234, 254, 137, 250, 190, 157, 153, 179, 175, 152, 152, 234, 234, 93, 8, 234, 254, 209, 133, 171, 202, 219, 177, 7, 12, 1, 14, 1, 16, 2, 18, 2, 22, 198, 192, 139, 194, 4, 20, 234, 254, 217, 192, 153, 189, 231, 156, 3, 20, 254, 248, 185, 9, 0, 10, 1, 23, 23, 0, 0, 215, 8, 174, 17 ],
  //   commitBuffer: Buffer(8) [ 91, 51, 210, 195, 154, 137, 239, 24 ],
  // }
}
```

### dechiper from tx

```
function exampleDecodeFromTxBuffer() {
  // https://mempool.space/testnet/tx/0201fbf76be120e0245f95011e9e92bf588d9d5888b0c1eb62823312a3a86a87
  const txBuffer = Buffer.from(
    // this is the pure output buffer
    "020304d5b59d81cfa3a0f520012603a002055806b89cde93898eca010ae8070888a4011601",
    "hex",
  );
  console.log({ txBuffer });

  const runestone = Runestone.dechiper(txBuffer);
  const buffer = runestone.enchiper();
  console.log({ buffer });
  // output:
  // {
  //   buffer: Buffer(37) [ 2, 3, 4, 213, 181, 157, 129, 207, 163, 160, 245, 32, 1, 38, 3, 160, 2, 6, 184, 156, 222, 147, 137, 142, 202, 1, 5, 88, 10, 232, 7, 8, 136, 164, 1, 22, 1 ],
  // }
  console.log(JSON.stringify(runestone));
  // output:
  // {"edicts":[],"etching":{"divisibility":"38","premine":"888888888888888","rune":"XVERSEFORTEST","spacers":"288","symbol":"88","terms":{"amount":"1000","cap":"21000","height":{},"offset":{}}},"pointer":"1"}

  const spacedRune = new SpacedRune(
    runestone.etching?.rune!,
    runestone.etching?.spacers!,
  );
  console.log(spacedRune.toString());
  // output: XVERSE•FOR•TEST
}

function main() {
  exampleEncode();
  exampleDecodeFromTxBuffer();
}
```
