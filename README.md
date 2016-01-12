# whole-line-stream

The main aim of this module is for passing output from subprocess to
standard output (or standard error) of the parent process.
If there are multiple such subprocesses, then they may be writing
chunks to their output which don't constitute whole lines.
If such chunks from different children get interleaved, the resulting
mix may be unintelegible.
To avoid this problem, the implementation at hand ensures that it is
reading a whole line from its input before passing that on to its
output.
To distinguish the children even better, each line passing through an
instance of this stream may be prefixed by some fixed string.

## Example

```js
var WholeLineStream = require("whole-line-stream");
var spawn = require("child_process").spawn;

// Run two process to list files. Not particularly useful, but short.
var find = spawn("find", [".", "-type", "f"]);
find.stdout.pipe(new WholeLineStream("[find] ")).pipe(process.stdout);
find.stderr.pipe(new WholeLineStream("[find] ")).pipe(process.stderr);
var git = spawn("git", ["ls-files"]);
git.stdout.pipe(new WholeLineStream("[git]   ")).pipe(process.stdout);
git.stderr.pipe(new WholeLineStream("[git]   ")).pipe(process.stderr);
```

## Carriage returns

The carriage return character `\r` is interpreted as moving the cursor
back to the beginning of the current line.
Subsequent output will overwrite the initial portion of the line.
This is used e.g. by [some Mocha reporters][mocha1].
The output of this stream will never contain `\r`.
This also means that Windows-style `\r\n` will get turned into plain `\n`.

[mocha1]: https://github.com/mochajs/mocha/blob/65e298416fdef2f3d40bff911b308289be5b42aa/lib/reporters/base.js#L151

## API

### new WholeLineStream([prefix])

Constructs a new WholeLineStream.
The optional prefix argument will be converted to a buffer,
which will be written to the output prior to each whole line of input.

## License

This package is licensed unter the MIT license.

## See also

The [split](https://www.npmjs.com/package/split) module does split its
input into lines as well, but it operates on strings not buffers, and
it doesn't support prefixing lines.
