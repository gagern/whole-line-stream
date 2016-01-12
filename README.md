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
