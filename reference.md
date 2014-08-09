Instructions
------------

Value | ASCII | Instruction | Effects
------- | ----- | ----------- | -------
33 | `!` | Logical not | `b` > `not b`
34 | `"` | Toggle stringmode | Pushes characters onto the stack until next quote
35 | `#` | Trampoline | Jumps over next character
36 | `$` | Pop | `a` >
37 | `%` | Modulo | `a` `b` > `a - b * floor(a/b)`
38 | `&` | Load from register | `r` > `a`
39 | `'` | Fetch character | > `c` and jumps over it
40 | `(` | Load semantics | `c` >
41 | `)` | Unload semantics | 
42 | `*` | Multiply | `a` `b` > `a * b`
43 | `+` | Add | `a` `b` > `a + b`
44 | `,` | Value output | `a` > displays `a` in console
45 | `-` | Subtract | `a` `b` > `a - b`
46 | `.` | Store to register | `a` `r` >
47 | `/` | Divide | `a` `b` > `a / b`
48-57 | `0`-`9` | Push number (0 to 9) | > `n`
58 | `:` | Duplicate | `a` > `a` `a`
59 | `;` | Jump over | Nothing executed until next semicolon
60 | `<` | Go west | `delta` = (-1, 0)
61 | `=` | Absolute position | `x` `y` >
62 | `>` | Go east | `delta` = (1, 0)
63 | `?` | Go away | Go in a random cardinal direction
64 | `@` | Stop | 
65-90 | `A`-`Z` | Semantics defined by extensions |
91 | `[` | Turn left | `delta` = counter-clockwise(`delta`)
92 | `\` | Swap | `a` `b` > `b` `a`
93 | `]` | Turn right | `delta` = clockwise(`delta`)
94 | `^` | Go north | `delta` = (0, -1)
95 | `_` | West-East | `b` > west if `b` otherwise east
96 | <code>&#96;</code> | Greater Than | `a` `b` > `1` if `a` > `b` otherwise `0`
97-102 | `a`-`f` | Push number (10 to 15) | > `n`
103 | `g` | Get character | `x` `y` > `c`
105 | `i` | Load vector from register | `r` `n` > `a_1` ... `a_n`
106 | `j` | Jump forward | `n` > go `n` times forward
107 | `k` | Iterate | `n` > execute next instruction `n` times
108 | `l` | Line return | 
110 | `n` | Negate | `a` > `-a`
111 | `o` | Store vector to register | `a_1` ... `a_n` `r` `n` >
112 | `p` | Get vector from stack | `i` `n` > `s_i+1` ... `s_i+n`
113 | `q` | Stack output | Displays the stack in console
114 | `r` | Reflect | `delta` = `-delta`
115 | `s` | Replace vector in stack | `s_i+1` ... `s_i+n` `i` `n` >
116 | `t` | Stack top | > `n` stack size before the instruction
117 | `u` | Wrap | 
118 | `v` | Go south | `delta` = (0, 1)
119 | `w` | Compare | `a` `b` > ] if `a` > `b`, [ if `a` < `b`, otherwise continue forward
120 | `x` | Absolute delta | `x` `y` > set `delta` = (`x`, `y`)
121 | `y` | Get from stack | `i` > `s_i`
122 | `z` | Replace in stack | `s_i` `i` >
123 | `{` | Jump to subroutine | `x` `y` >
124 | <code>&#124;</code> | North-South | `b` > north if `b` otherwise south
125 | `}` | Return from subroutine | 

`a` `b` > `a + b` means the instruction pops `b`, pops `a`, and pushes `a + b`.

Index `i` can be negative, meaning counting down from the top of the stack.

Extensions
----------

The extension *m (common math)* is loaded at beginning.

### m (common math)

ASCII | Instruction | Effects
----- | ----------- | -------
`A` | Abs | `a` > `abs(a)`
`C` | Cos | `a` > `cos(a)`
`E` | Exp | `a` > `exp(a)`
`F` | Floor | `a` > `floor(a)`
`I` | Min | `a` `b` > `min(a, b)`
`J` | Max | `a` `b` > `max(a, b)`
`L` | Log | `a` > `log(a)`
`M` | Mix | `a` `b` `t` > `a * (1 - t) + b * t`
`P` | Pi | > `3.14...`
`Q` | Sqrt | `a` > `sqrt(a)`
`R` | Random | > `a` in [0, 1[
`S` | Sin | `a` > `sin(a)`
`W` | Power | `a` `e` > `a^e`

### M (matrix manipulation)

**Not yet implemented!**

ASCII | Instruction | Effects
----- | ----------- | -------
`M` | Multiply | `m_00` ... `m_ij` `i` `j` `k` > `m_00` ... `m_ij`
`X` | Rotation around X | `rad` `i` > `m_00` ... `m_ii`
`Y` | Rotation around Y | `rad` `i` > `m_00` ... `m_ii`
`Z` | Rotation around Z | `rad` `i` > `m_00` ... `m_ii`

### V (vector manipulation)

ASCII | Instruction | Effects
----- | ----------- | -------
`A` | Add | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `a_1 + b_1` ... `a_n + b_n`
`D` | Dot | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `dot(a, b)`
`I` | Min | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `min(a_1, b_1)` ... `min(a_n, b_n)`
`J` | Max | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `max(a_1, b_1)` ... `max(a_n, b_n)`
`K` | Scale | `a_1` ... `a_n` `k` `n` > `k * a_1` ... `k * a_n`
`L` | Length | `a_1` ... `a_n` `n` > `length(a)`
`M` | Mix | `a_1` ... `a_n` `b_1` ... `b_n` `t` `n` > `mix(a_1, b_1, t)` ... `mix(a_n, b_n, t)`
`N` | Normalize | `a_1` ... `a_n` `n` > `a_1 / length` ... `a_n / legth`
`O` | Modulo | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `a_1 % b_1` ... `a_n % b_n`
`S` | Subtract | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `a_1 - b_1` ... `a_n - b_n`
`V` | Divide | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `a_1 / b_1` ... `a_n / b_n`
`W` | Duplicate | `a_1` ... `a_n` `n` > `a_1` ... `a_n` `a_1` ... `a_n`
`X` | Cross | `a_1` `a_2` `a_3` `b_1` `b_2` `b_3` > `c_1` `c_2` `c_3` only in 3D
`Y` | Multiply | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `a_1 * b_1` ... `a_n * b_n`

### Candidate

ASCII | Instruction | Effects
----- | ----------- | -------
`T` | Texture | `u` `v` `i` > `r` `g` `b`

Program interface
-----------------

In Webfunge, the program is executed once for each pixel at each frame.

The program starts with following stack:

- 4: `time`
- 3: `height`
- 2: `width`
- 1: `y` in [0, height[
- 0: `x` in [0, width[

`x`, `y`, `width`, and `height` are in pixels. `x` goes from left to right and `y` from top to bottom. The canvas size is smaller than the screen and depends on the Resolution dropdown and the screen aspect ratio.

`time` is in seconds.

When the program is done, `B`, `G`, and then `R` is popped off the stack, which means
you have to push `R`, `G`, and `B` before you exit (values in [0, 1]).

Editor
------

*Tab* hides the editor and thus allows instructions `,` and `q`.

*Ctrl + Enter* compiles the code.

*Ctrl + Space* shows the reference.  

Language guide
--------------

### Program execution

The program is a 2D grid of characters. Each character can be both a data value and a code instruction, depending on the context.

The **instruction pointer** (IP) is the 2D vector pointing to the instruction being executed. The IP's **delta** is the 2D vector which is added to the IP after each instruction.

At the beginning of the program, the IP is (0, 0) i.e. at the top left of the program, and it's delta is (1, 0) i.e. it moves to the right.

Several instructions can change the delta. The most simple ones are `>` (*East*), `<` (*West*), `^` (*North*), and `v` (*South*). When these instructions are executed, the delta is changed such as the IP now moves in the direction pointed by the character.

	>v
	^<
	Infinite loop (should be avoided!)

The `?` (*Go away*) instruction randomly changes the delta to east, west, north, or south.

	12481> #+?\# _.@
	Random number generator in [1, 16]

All the previous instructions assign a **cardinal unit** vector to delta, i.e. 1 or -1 in one axis and 0 in the other. However it could be anything. The `x` (*Absolute delta*) pops y off the stack, pops x, and sets the delta to (x, y).

The `[` (*Turn left*) and `]` (*Turn right*) instructions rotate the delta by 90 degrees. To remember which is which, visualize yourself on the seat of a bicycle, looking down at the handlebars:

	   +-          +--+          -+
	   |           '  '           |
	   +-                        -+  
	
	Turn left   Go forward   Turn right

The `r` (*Reflect*) multiplies the delta by -1. 

The `@` (*Stop*) instruction stops the program execution.

### Stack

Most operations rely on a stack. It stores decimal values.

The instructions `0` to `9` push the numbers 0 to 9 onto the stack. The instructions `a` to `f` push the numbers 10 to 15 respectively onto the stack, because it's their value in hexadecimal.

The `+` (*Add*) instruction pops a value *b* off the stack, then pops a value *a*, then pushes the sum of *a* and *b* back onto the stack. (*a* is called *a* because it was the first of the two values to be pushed onto the stack.) The `-` (*Subtract*), `*` (*Multiply*), `/` (*Division*), and `%` (*Modulo*, remainder of division) act in the same way.

The `$` (*Pop*) instruction pops a value off the stack and discards it.

The `:` (*Duplicate*) instruction pops a value off the stack and pushes it twice onto the stack.

The `\` (*Swap*) instruction pops two values off the stack, then pushes the first value back on, then the second value, in effect swapping the top two values on the stack.

The `n` (*Negate*) instruction pops a value off the stack and pushes the opposite back onto the stack.

The `y` (*Get from stack*) instruction pops an *index* off the stack, then pushes the value at this *index* in the stack onto the stack. The first item in the stack is at index 0. If *index* is negative, it is counted down from the top of the stack.

	789 3ny
	Stack is [7, 8, 9, 8]

The `z` (*Replace in stack*) instruction pops an *index* off the stack, then pops a value, then sets the stack at *index* to this value.

	789 a 4nz
	Stack is [7, 10, 9]

The `p` (*Get vector from stack*) instruction pops a number *n* off the stack, then pops an *index*, then pushes the *n* values at indexes *index* to *index + n - 1* onto the stack. 

The `s` (*Replace vector in stack*) instruction pops a number *n* off the stack, then pops an *index*, then pops *n* values and sets the stack at indexes *index* to *index + n - 1* to these values. 

### Strings

The `"` (*Toggle stringmode*) instruction toggles the stringmode. When this mode is activated, every character encountered by the IP (except a subsequent `"`) is not interpreted as a instruction, but rather its ASCII value is pushed onto the stack.

	"Hello"
	Pushes 72, 101, 108, 108, and 111 onto the stack

The `'` (*Fetch character*) instruction pushes the ASCII value of the next encountered character, then jumps over it. 

	'V
	Pushes 86 onto the stack

The `g` (*Get character*) instruction pops a value *y* off the stack, then pops a value *x*, then pushes the ASCII value of the character at position (*x*, *y*).

### Flow control

The `#` (*Trampoline*) instruction moves the IP by one delta more, in effect jumping over the character the IP would normally reach next.

The `;` (*Jump over*) marker causes the IP to jump over all subsequent instructions until the next `;` marker.

The `j` (*Jump forward*) instructions pops a value off the stack, and jumps over that many spaces. Null or negative values are legal. If this value is 1, it acts like `#`.

The `k` (*Iterate*) instruction pops a value *n* off the stack, moves the IP by its delta, and execute *n* times this instruction. If *n* is zero or negative, the instruction is not executed.

The `=` (*Absolute position*) instruction pops a value *y* off the stack, then pops a value *x*, then sets the IP to (*x*, *y*).

The `{` (*Jump to subroutine*) instruction pops a value `y` off the stack, then pops a value `x`, then save the current IP (and it's delta) onto the call stack, then sets the IP to (*x*, *y*) and it's delta to (1, 0), meaning a subroutine always starts on the east direction.

The `}` (*Return from subroutine*) instruction pushes an IP off the call stack, and restores the current IP.

### Wrapping

Befunge uses a n-dimensional Lahey space. In 2D, it's basically a extension of a torus surface. When the IP goes too far in any given direction, it wraps in the other side of the program, such as if it keeps the same delta it will eventually reach the same position before it wrapped.

For convenience, the instructions `l` and `u` have been added. Warning, you may lose awesomeness points if you use them.

The `u` (*Wrap*) instruction triggers a wrap, ignoring the instructions further on the IP's path.

The `l` (*Line return*) instruction turns the IP to the right, then moves it one step, then turns it to the left, then triggers a wrap.

### Test

The `!` (*Logical not*) instruction pops a off the stack. If this value is exactly zero onto the stack, it pushes a one, otherwise it pushes a zero.

The <code>`</code> (*Greater than*) instruction pops two values off the stack, then pushes a one if second value is greater than the first, otherwise pushes a zero.

The `_` (*West-East*) instruction pops a value off the stack. If it is zero it acts like `>`, otherwise it acts like `<`.

The `|` (*North-South*) instruction pops a value off the stack. If it is zero it acts like `v`, otherwise it acts like `^`.

The `w` (*Compare*) instruction pops a value *b* off the stack, then pops a value *a*, then compares them. If the *a* is smaller, `w` acts like `[`, and turns left. If the *a* is greater, `w` acts like `]`, and turns right. If *a* and *b* are equal, `w` does not affect the IP's delta.

### Registers

Registers are another storage space independent of the stack. They act like named variables.

There are 16 registers. To store and load a value from a register, use the two following instructions.

The `.` (*Store to register*) instruction pops a value *r* off the stack, then pops a value *a*, then stores *a* in the register *r*. 

The `&` (*Load from register*) instruction pops a value *r* off the stack, then pushes the value stored in the register *r*.

Each register can actually store up to 8 values. It's meant to store vectors. To store and load a vector from a register, use the two following instructions.

The `o` (*Store vector to register*) instruction pops a value *n* off the stack, then pops a value *r*, then pops *n* values and stores them in the register *r*. 

The `i` (*Load vector from register*) instruction pops a value *n* off the stack, then pops a value *r*, then pushes *n* values from the register *r*. 

### Extension

Extensions allow to use special semantics. They are similar to libraries in other languages.

Extensions may define instructions between `A` and `Z`. When resolving extension instructions, the most recently loaded extension is checked first, then the previous one, and so on. If the instruction isn't defined by any loaded extension, the IP's delta is mirrored (i.e. acts like `r`).

For convenience, the *math* extension is always loaded at the beginning.

The `(` (*Load extension*) instruction pops a number off the stack, and loads the corresponding extension. The number is the corresponding value of the extension's character given in the reference above, thus you should use the `'` instruction to pushes it onto the stack. 

	'V( ;vector extension is loaded; )

The `)` (*Unload extension*) instruction unloads the most recently loaded extension.

### Debug

The `t` (*Stack top*) instruction pushes the number of elements in the stack (before the execution of this instruction) onto the stack.

The two following instructions are provided for convenience in order to debug programs. To make them work, you have to first hide the editor using the key *Tab*. Then, these instructions will only print values (in the browser's developper console) for the pixel right under the mouse cursor.

The `,` (*Value output*) instruction pops a number off the stack, and prints it.

The `q` (*Stack output*) instruction prints the stack.

Awesomeness points
------------------

**In progress, feel free to send feedback**

You may use this table for evaluating a program score, e.g. during live programming events. 

If you use | then you get
---------- | ------------
a character both as code instruction and data value | +10
`l` in a non-cardinal direction | +10
the same character from different paths | +5
`l` in the west direction | -10